import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * IAM 配置 — 平台无关的配置面
 *
 * 当前变量名带 LOGTO_ 前缀（历史沿用）；批次 1 完成后业务侧只依赖本类，
 * 未来切换 IAM 时仅需调整本类读取的变量映射。
 */
export interface IamConfig {
  /** 'logto'（第一实现；未来 'keycloak' / 'authentik' ...） */
  provider: string;
  /** default 租户 Management API 基址（如 http://localhost:3003/api） */
  managementApiEndpoint: string;
  /** admin 租户 OIDC 端点 — M2M token 交换必须走这里（F5 实测） */
  adminOidcEndpoint: string;
  /** default 租户 OIDC 端点（平台登录 / 应用接入下发） */
  oidcEndpoint: string;
  /** M2M 应用凭据（F1：替代静态 API key） */
  m2mAppId: string;
  m2mAppSecret: string;
  /** Management API 资源标识（Logto 默认值） */
  managementApiResource: string;
  /** 平台自身 OIDC client（认证模块） */
  platformAppId: string;
  platformAppSecret?: string;
  platformRedirectUri: string;
}

@Injectable()
export class IamConfigService {
  constructor(private readonly configService: ConfigService) {}

  getConfig(): IamConfig {
    const provider = this.get('IAM_PROVIDER') ?? 'memory';
    return {
      provider,
      managementApiEndpoint: this.get('LOGTO_MANAGEMENT_API_ENDPOINT') ?? '',
      adminOidcEndpoint: this.get('LOGTO_ADMIN_OIDC_ENDPOINT') ?? '',
      oidcEndpoint: this.get('LOGTO_ENDPOINT') ?? '',
      m2mAppId: this.get('LOGTO_M2M_APP_ID') ?? '',
      m2mAppSecret: this.get('LOGTO_M2M_APP_SECRET') ?? '',
      managementApiResource:
        this.get('LOGTO_MANAGEMENT_API_RESOURCE') ?? 'https://default.logto.app/api',
      platformAppId: this.get('LOGTO_APP_ID') ?? '',
      platformAppSecret: this.get('LOGTO_APP_SECRET') ?? undefined,
      platformRedirectUri:
        this.get('LOGTO_REDIRECT_URI') ?? 'http://localhost:3001/api/auth/callback',
    };
  }

  private get(key: string): string | undefined {
    return this.configService.get<string>(key);
  }

  private require(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`[IamConfig] Missing required environment variable: ${key}`);
    }
    return value;
  }
}
