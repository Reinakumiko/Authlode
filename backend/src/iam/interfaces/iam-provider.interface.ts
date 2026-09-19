import type {
  IamApplication,
  IamCreateApplication,
  IamCreateOrganization,
  IamCreateOrgRole,
  IamCreateRole,
  IamCreateUser,
  IamOidcEndpoints,
  IamOrganization,
  IamOrganizationUser,
  IamOrgRole,
  IamPageQuery,
  IamPagedResult,
  IamRole,
  IamUpdateApplication,
  IamUpdateOrganization,
  IamUpdateRole,
  IamUpdateUser,
  IamUser,
  IamUserOrganization,
  IamUserQuery,
} from './iam-models';
import type { IamCapabilities } from './iam-capabilities';

/**
 * IAM Provider 契约 — 业务模块的唯一身份操作依赖
 *
 * - 实现方：各 IAM 平台的 Adapter（LogtoAdapter 为第一实现）
 * - 消费方：业务模块一律注入 IAM_PROVIDER 符号，不感知具体平台
 * - 换 IAM = 新增一个 Adapter 实现 + IAM_PROVIDER 配置切换，业务代码零改动
 *
 * 实测校准（批次 0，见 docs/SSO平台实施方案.md 0.4）：
 * - F1: Adapter 必须内置 M2M token 管理器（获取/缓存/过期刷新）
 * - F5: Logto 的 token 交换走 admin 租户端点，API 调用走 default 租户
 * - V5: 入组/授权原生幂等；建号不幂等（重复 email 422）→ 先查后建是调用方责任
 */

/** 依赖注入 token */
export const IAM_PROVIDER = Symbol('IAM_PROVIDER');

export interface IamProviderInterface {
  /** 能力探测：功能按 IAM 支持度降级 */
  getCapabilities(): IamCapabilities;

  // ── 用户 ────────────────────────────────────────────────────────

  getUsers(query?: IamUserQuery): Promise<IamPagedResult<IamUser>>;
  getUserById(userId: string): Promise<IamUser>;
  /** 按 email 精确查找（邀请"先查后建"幂等锚点）；不存在返回 null */
  getUserByEmail(email: string): Promise<IamUser | null>;
  createUser(data: IamCreateUser): Promise<IamUser>;
  updateUser(userId: string, data: IamUpdateUser): Promise<IamUser>;
  deleteUser(userId: string): Promise<void>;
  updateUserPassword(userId: string, password: string): Promise<void>;

  // ── 租户（Organization）────────────────────────────────────────

  /** 组织列表（运营/统计视角；租户端界面用 TenantContext 作用域查询） */
  getOrganizations(query?: IamPageQuery): Promise<IamPagedResult<IamOrganization>>;
  createOrganization(data: IamCreateOrganization): Promise<IamOrganization>;
  getOrganizationById(orgId: string): Promise<IamOrganization>;
  updateOrganization(orgId: string, data: IamUpdateOrganization): Promise<IamOrganization>;
  deleteOrganization(orgId: string): Promise<void>;
  /** 组织成员列表（租户作用域用户查询 — 用户管理租户化的数据源） */
  getOrganizationUsers(orgId: string, query?: IamPageQuery): Promise<IamPagedResult<IamOrganizationUser>>;
  /** 入组（原生幂等，V5 实证）；可同时授予组织角色 */
  addOrganizationUsers(orgId: string, userIds: string[], organizationRoleIds?: string[]): Promise<void>;
  removeOrganizationUser(orgId: string, userId: string): Promise<void>;
  /** 用户的多租户归属 + 各组织角色（TenantContext 数据源） */
  getUserOrganizations(userId: string): Promise<IamUserOrganization[]>;

  // ── 组织角色（模板级定义，按"用户 × 组织"分配）─────────────────

  getOrganizationRoles(): Promise<IamOrgRole[]>;
  createOrganizationRole(data: IamCreateOrgRole): Promise<IamOrgRole>;
  getUserOrganizationRoles(orgId: string, userId: string): Promise<IamOrgRole[]>;
  assignUserOrganizationRoles(orgId: string, userId: string, roleIds: string[]): Promise<void>;
  removeUserOrganizationRole(orgId: string, userId: string, roleId: string): Promise<void>;

  // ── 实例级角色（全局角色，非组织作用域）────────────────────────

  getRoles(query?: IamPageQuery): Promise<IamPagedResult<IamRole>>;
  getRoleById(roleId: string): Promise<IamRole>;
  createRole(data: IamCreateRole): Promise<IamRole>;
  updateRole(roleId: string, data: IamUpdateRole): Promise<IamRole>;
  deleteRole(roleId: string): Promise<void>;
  assignRoleToUser(roleId: string, userId: string): Promise<void>;
  removeRoleFromUser(roleId: string, userId: string): Promise<void>;

  // ── 应用（系统接入的 OIDC 客户端）───────────────────────────────

  getApplications(query?: IamPageQuery): Promise<IamPagedResult<IamApplication>>;
  getApplicationById(appId: string): Promise<IamApplication>;
  createApplication(data: IamCreateApplication): Promise<IamApplication>;
  updateApplication(appId: string, data: IamUpdateApplication): Promise<IamApplication>;
  deleteApplication(appId: string): Promise<void>;

  // ── OIDC 端点（认证模块 / 应用接入页消费）─────────────────────

  getOidcEndpoints(): IamOidcEndpoints;
}
