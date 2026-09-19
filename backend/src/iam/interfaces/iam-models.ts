/**
 * IAM 领域模型 — 平台无关的身份数据契约
 *
 * 这些模型是 Authlode 业务层的唯一身份数据形状；
 * 各 IAM 平台（Logto / Keycloak / ...）的原始数据由 Adapter 转换为本模型。
 * 业务模块禁止 import 任何平台特定类型。
 */

// ── 分页 ──────────────────────────────────────────────────────────

export interface IamPageQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface IamPagedResult<T> {
  data: T[];
  totalCount: number;
}

// ── 用户 ──────────────────────────────────────────────────────────

export interface IamUser {
  id: string;
  username?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  name?: string | null;
  avatar?: string | null;
  isSuspended?: boolean;
  createdAt?: string;
  updatedAt?: string;
  customData?: Record<string, unknown>;
}

export interface IamCreateUser {
  username?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  name?: string;
  /** 邀请注册流程的初始密码（V1 已验证 Logto 支持） */
  password?: string;
  /** 哈希导入（可选能力） */
  passwordDigest?: { digest: string; algorithm: string };
  customData?: Record<string, unknown>;
}

export interface IamUpdateUser {
  username?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  name?: string;
  avatar?: string;
  isSuspended?: boolean;
  customData?: Record<string, unknown>;
}

export interface IamUserQuery extends IamPageQuery {
  emailVerified?: boolean;
  isSuspended?: boolean;
}

// ── 租户（IAM Organization）───────────────────────────────────────

export interface IamOrganization {
  id: string;
  name: string;
  description?: string | null;
  customData?: Record<string, unknown>;
  createdAt?: string;
}

export interface IamCreateOrganization {
  name: string;
  description?: string;
  customData?: Record<string, unknown>;
}

export interface IamUpdateOrganization {
  name?: string;
  description?: string;
  customData?: Record<string, unknown>;
}

/** 用户的多租户归属（含该用户在各组织的角色）— 多归属查询结果 */
export interface IamUserOrganization {
  organization: IamOrganization;
  organizationRoles: IamOrgRole[];
}

export interface IamOrganizationUser {
  userId: string;
  username?: string | null;
  primaryEmail?: string | null;
  name?: string | null;
  joinedAt?: string;
}

// ── 组织角色（模板级定义，按"用户 × 组织"分配）────────────────────

export interface IamOrgRole {
  id: string;
  name: string;
  description?: string | null;
}

export interface IamCreateOrgRole {
  name: string;
  description?: string;
}

// ── 应用（系统接入的 OIDC 客户端）─────────────────────────────────

export type IamApplicationType = 'traditional' | 'spa' | 'native' | 'm2m';

export interface IamApplication {
  id: string;
  name: string;
  description?: string | null;
  type: IamApplicationType;
  /** 仅机密应用返回；public client 为 null */
  secret?: string | null;
  oidcClientMetadata?: {
    redirectUris: string[];
    postLogoutRedirectUris: string[];
    tokenEndpointAuthMethod?: string | null;
  };
}

export interface IamCreateApplication {
  name: string;
  description?: string;
  type: IamApplicationType;
  redirectUris: string[];
  postLogoutRedirectUris?: string[];
}

export interface IamUpdateApplication {
  name?: string;
  description?: string;
  redirectUris?: string[];
  postLogoutRedirectUris?: string[];
}

// ── OIDC 端点信息（应用接入页下发 + 认证模块消费）─────────────────

export interface IamOidcEndpoints {
  issuer: string;
  authorizationUrl: string;
  tokenUrl: string;
  jwksUri: string;
  userinfoUrl: string;
  endSessionUrl: string;
}
