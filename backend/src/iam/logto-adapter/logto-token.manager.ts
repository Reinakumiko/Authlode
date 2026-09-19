import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IamConfigService } from '../iam.config';

/**
 * Logto M2M Token 管理器
 *
 * 修正实测发现 F1/F5（批次 0）：
 * - F1: Logto 不支持静态 API key —— 必须 client_credentials 动态换 token
 * - F5: token 交换必须走 **admin 租户**端点（:3002/oidc/token），
 *       换到的 token 用于调用 default 租户 Management API（:3003/api）
 * - token 约 1h 过期 → 内存缓存 + 提前 60s 安全余量刷新
 */
@Injectable()
export class LogtoTokenManager {
  private readonly logger = new Logger(LogtoTokenManager.name);
  private accessToken?: string;
  private expiresAt = 0; // 毫秒时间戳

  constructor(
    private readonly iamConfigService: IamConfigService,
    private readonly httpService: HttpService,
  ) {}

  /** 获取可用的 Management API access token（带缓存与自动刷新） */
  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt - 60_000) {
      return this.accessToken;
    }
    return this.refreshToken();
  }

  private async refreshToken(): Promise<string> {
    const config = this.iamConfigService.getConfig();

    const response = await firstValueFrom(
      this.httpService.post(
        `${config.adminOidcEndpoint}/oidc/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: config.m2mAppId,
          client_secret: config.m2mAppSecret,
          resource: config.managementApiResource,
          scope: 'all',
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      ),
    );

    const { access_token: accessToken, expires_in: expiresIn } = response.data as {
      access_token: string;
      expires_in?: number;
    };
    if (!accessToken) {
      throw new Error('[LogtoTokenManager] Token exchange failed: no access_token in response');
    }

    this.accessToken = accessToken;
    this.expiresAt = Date.now() + (expiresIn ?? 3600) * 1000;
    this.logger.debug(`Management API token refreshed (expires_in=${expiresIn ?? 3600}s)`);
    return accessToken;
  }
}
