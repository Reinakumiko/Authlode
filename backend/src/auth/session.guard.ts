import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthSessionService, AUTH_SESSION_COOKIE } from './auth-session.service';
import type { AuthSessionPayload } from './auth-session.service';

/** 无需会话的路径（登录流程；批次 3 的公开注册页将加入） */
const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/callback', '/api/auth/logout'];

/** 携带会话的请求类型（守卫附加，控制器/下游消费） */
export interface AuthenticatedRequest extends Request {
  authSession?: AuthSessionPayload;
}

/**
 * 会话守卫（B1.6，全局 APP_GUARD）
 *
 * 验收标准 B1-1：未登录访问任何业务 API → 401。
 * 白名单：登录流程三端点。
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionService: AuthSessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // 公开端点（/api/public/**）+ 登录流程免认证
    if (
      request.path.startsWith('/api/public/') ||
      request.path.startsWith('/api/auth/login') ||
      request.path === '/api/auth/mode' ||
      PUBLIC_PATHS.some((path) => request.path === path)
    ) {
      return true;
    }

    const session = this.readSession(request);
    if (!session) {
      throw new UnauthorizedException('Not authenticated');
    }
    request.authSession = session;
    return true;
  }

  private readSession(req: Request): AuthSessionPayload | null {
    const header = req.headers?.cookie;
    if (!header) {
      return null;
    }
    for (const part of header.split(';')) {
      const [key, ...rest] = part.trim().split('=');
      if (key === AUTH_SESSION_COOKIE) {
        return this.sessionService.verifySession(
          decodeURIComponent(rest.join('=')),
        );
      }
    }
    return null;
  }
}
