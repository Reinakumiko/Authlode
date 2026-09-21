import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import {
  AuthSessionService,
  AUTH_PRE_COOKIE,
  AUTH_SESSION_COOKIE,
} from './auth-session.service';
import type { AuthSessionPayload } from './auth-session.service';
import { IAM_PROVIDER } from '../iam/interfaces';
import type { IamProviderInterface } from '../iam/interfaces';

/**
 * OIDC 认证控制器 — 平台自身的登录/回调/登出/身份
 *
 * 流程（实施方案 1.3，批次 0 实测校准）：
 * login → 302 Logto（PKCE + prompt=consent）→ 登录页 → callback
 * → code 换 token + userinfo → 平台会话（httpOnly JWT cookie）→ 302 前端
 *
 * 注：不引入 cookie-parser 依赖 — readCookie 手工解析（受控 cookie 名，足够）
 */
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: AuthSessionService,
    private readonly configService: ConfigService,
    @Inject(IAM_PROVIDER) private readonly iamProvider: IamProviderInterface,
  ) {}

  /** 发起登录：PKCE + state → 预授权 cookie → 302 Logto 授权页 */
  @Get('login')
  login(@Res() res: Response) {
    const pkce = this.authService.generatePkce();
    const preAuthToken = this.sessionService.signPreAuth({
      state: pkce.state,
      verifier: pkce.verifier,
    });
    const authorizeUrl = this.authService.buildAuthorizeUrl(
      pkce.state,
      pkce.challenge,
    );
    res.cookie(AUTH_PRE_COOKIE, preAuthToken, this.cookieOptions(600));
    return res.redirect(authorizeUrl);
  }

  /**
   * Memory 模式登录：用户名/邮箱 + 密码 → 自签 JWT 会话
   * 前端 login.vue 在 memory 模式下调此端点（不跳转 OIDC）
   */
  @Post('login')
  async loginWithPassword(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body?.email || !body?.password) {
      throw new UnauthorizedException('邮箱和密码必填');
    }

    // 查用户（先按 email，再按 username）
    let user = await this.iamProvider.getUserByEmail(body.email);
    if (!user) {
      const users = await this.iamProvider.getUsers({ search: body.email, pageSize: 5 });
      user = users.data.find(u => u.username === body.email) ?? null;
    }
    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 验证密码
    const memoryAdapter = this.iamProvider as unknown as { verifyPassword?: (id: string, pw: string) => Promise<boolean> };
    if (typeof memoryAdapter.verifyPassword === 'function') {
      const valid = await memoryAdapter.verifyPassword(user.id, body.password);
      if (!valid) {
        throw new UnauthorizedException('账号或密码错误');
      }
    } else {
      throw new UnauthorizedException('当前引擎不支持密码登录');
    }

    // 签发会话
    const sessionToken = this.sessionService.signSession({
      sub: user.id,
      rt: '',
    });
    res.cookie(AUTH_SESSION_COOKIE, sessionToken, this.cookieOptions(7 * 24 * 3600));
    return {
      success: true,
      user: { id: user.id, username: user.username, primaryEmail: user.primaryEmail, name: user.name },
    };
  }

  /** 获取当前引擎模式（前端判断登录方式） */
  @Get('mode')
  getMode() {
    const provider = process.env.IAM_PROVIDER ?? 'memory';
    return { provider, authType: provider === 'memory' ? 'password' : 'oidc' };
  }

  /** 回调：校验 state → code 换 token → userinfo → 会话 → 302 前端 */
  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    const code = this.getQuery(req, 'code');
    const state = this.getQuery(req, 'state');
    if (!code || !state) {
      throw new UnauthorizedException('Missing code/state');
    }

    const preCookie = this.readCookie(req, AUTH_PRE_COOKIE);
    const preAuth = preCookie
      ? this.sessionService.verifyPreAuth(preCookie)
      : null;
    if (!preAuth || preAuth.state !== state) {
      throw new UnauthorizedException('Invalid state');
    }

    const tokens = await this.authService.exchangeCode(code, preAuth.verifier);
    if (!tokens.refresh_token) {
      // F2：授权请求缺 prompt=consent 时出现 — 配置错误应显式失败
      throw new UnauthorizedException(
        'No refresh_token returned (check prompt=consent)',
      );
    }

    const userinfo = await this.authService.fetchUserinfo(tokens.access_token);

    const sessionToken = this.sessionService.signSession({
      sub: userinfo.sub,
      rt: tokens.refresh_token,
    });
    res.clearCookie(AUTH_PRE_COOKIE);
    res.cookie(AUTH_SESSION_COOKIE, sessionToken, this.cookieOptions(7 * 24 * 3600));
    return res.redirect(this.frontendUrl());
  }

  /** 当前身份 + 所属组织与各组织角色（验收 B1-2） */
  @Get('me')
  async me(@Req() req: Request) {
    const session = this.requireSession(req);
    try {
      const [user, userOrganizations] = await Promise.all([
        this.iamProvider.getUserById(session.sub),
        this.iamProvider.getUserOrganizations(session.sub),
      ]);
      return {
        id: user.id,
        username: user.username,
        primaryEmail: user.primaryEmail,
        name: user.name,
        organizations: userOrganizations.map((org) => ({
          id: org.organization.id,
          name: org.organization.name,
          roles: org.organizationRoles.map((role) => role.name),
        })),
      };
    } catch {
      return { id: session.sub };
    }
  }

  /** 登出：清平台会话（memory 模式直接回前端；logto 模式跳 end_session） */
  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie(AUTH_SESSION_COOKIE);
    const provider = process.env.IAM_PROVIDER ?? 'memory';
    if (provider === 'memory') {
      return res.redirect(this.frontendUrl() + '/login');
    }
    return res.redirect(this.authService.buildLogoutUrl());
  }

  /** 修改密码 */
  @Post('change-password')
  async changePassword(@Req() req: Request, @Body() body: { newPassword: string }) {
    const session = this.requireSession(req);
    if (!body?.newPassword || body.newPassword.length < 8) {
      throw new UnauthorizedException('密码至少 8 位');
    }
    await this.iamProvider.updateUserPassword(session.sub, body.newPassword);
    return { success: true };
  }

  // ── 内部 ─────────────────────────────────────────────────────────

  private requireSession(req: Request): AuthSessionPayload {
    const token = this.readCookie(req, AUTH_SESSION_COOKIE);
    const session = token ? this.sessionService.verifySession(token) : null;
    if (!session) {
      throw new UnauthorizedException('Not authenticated');
    }
    return session;
  }

  private readCookie(req: Request, name: string): string | undefined {
    const header = req.headers.cookie;
    if (!header) {
      return undefined;
    }
    for (const part of header.split(';')) {
      const [key, ...rest] = part.trim().split('=');
      if (key === name) {
        return decodeURIComponent(rest.join('='));
      }
    }
    return undefined;
  }

  private getQuery(req: Request, key: string): string | undefined {
    const value = req.query[key];
    return typeof value === 'string' ? value : undefined;
  }

  private cookieOptions(maxAgeSeconds: number) {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: maxAgeSeconds * 1000,
    };
  }

  private frontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    );
  }
}
