import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createHash, randomBytes } from 'node:crypto';
import { firstValueFrom } from 'rxjs';
import { IamConfigService } from '../iam/iam.config';

export interface PkceChallenge {
  state: string;
  verifier: string;
  challenge: string;
}

export interface OidcTokens {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in?: number;
}

export interface OidcUserinfo {
  sub: string;
  [key: string]: unknown;
}

/**
 * OIDC 认证服务 — 平台自身作为 Logto 的 client（public + PKCE）
 *
 * 实测校准（批次 0，F2/F7）：
 * - F7：public client 强制 PKCE（S256）
 * - F2：授权请求必须带 prompt=consent，否则 offline_access 被静默丢弃（拿不到 RT）
 * - 身份来源：userinfo（/oidc/me）— token 端点直连可信信道，比 id_token 本地校验简单可靠
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly iamConfigService: IamConfigService,
    private readonly httpService: HttpService,
  ) {}

  /** 生成 PKCE 对 + state */
  generatePkce(): PkceChallenge {
    const verifier = this.base64url(randomBytes(48));
    const challenge = this.base64url(
      createHash('sha256').update(verifier).digest(),
    );
    const state = this.base64url(randomBytes(24));
    return { state, verifier, challenge };
  }

  /** 构建授权 URL（F2：prompt=consent 必需） */
  buildAuthorizeUrl(state: string, challenge: string): string {
    const { platformAppId, platformRedirectUri, oidcEndpoint } =
      this.iamConfigService.getConfig();
    const params = new URLSearchParams({
      client_id: platformAppId,
      redirect_uri: platformRedirectUri,
      response_type: 'code',
      scope: 'openid offline_access urn:logto:scope:organizations',
      resource: 'urn:logto:resource:organizations',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      prompt: 'consent',
    });
    return `${oidcEndpoint}/oidc/auth?${params.toString()}`;
  }

  /** code 换 token（PKCE verifier） */
  async exchangeCode(code: string, verifier: string): Promise<OidcTokens> {
    const { platformAppId, platformRedirectUri, oidcEndpoint } =
      this.iamConfigService.getConfig();
    const response = await firstValueFrom(
      this.httpService.post(
        `${oidcEndpoint}/oidc/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: platformRedirectUri,
          client_id: platformAppId,
          code_verifier: verifier,
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      ),
    );
    return response.data as OidcTokens;
  }

  /** userinfo — 身份来源 */
  async fetchUserinfo(accessToken: string): Promise<OidcUserinfo> {
    const { oidcEndpoint } = this.iamConfigService.getConfig();
    const response = await firstValueFrom(
      this.httpService.get(`${oidcEndpoint}/oidc/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );
    return response.data as OidcUserinfo;
  }

  /**
   * 登出 URL（Logto end_session）
   * 注：post_logout_redirect_uri 需在应用的 postLogoutRedirectUris 注册，
   * 当前 POC 应用注册为空 — 批次 2 应用接入配置时补；此处跳转到 Logto 默认登出页
   */
  buildLogoutUrl(): string {
    const { oidcEndpoint } = this.iamConfigService.getConfig();
    return `${oidcEndpoint}/oidc/session/end`;
  }

  private base64url(buffer: Buffer): string {
    return buffer.toString('base64url');
  }
}
