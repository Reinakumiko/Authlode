/**
 * IAM 能力探测 — 不同 IAM 平台支持度不同，功能按能力降级
 *
 * 总纲 3.1："接什么 IAM 都差不多"是设计目标而非免费午餐——
 * 能力差异经此接口显式暴露，业务模块按能力分支，不做硬编码假设。
 */

export interface IamCapabilities {
  /** 组织角色（租户管理员判定依赖） */
  organizationRoles: boolean;
  /** 用户多组织归属查询（TenantContext 数据源） */
  userOrganizationsQuery: boolean;
  /** 创建用户时设置初始密码（邀请注册依赖） */
  createUserWithPassword: boolean;
  /** 组织自定义数据（任意 JSON） */
  organizationCustomData: boolean;
  /** 原生组织邀请 API（本平台自建邀请库，此项仅作增强参考） */
  nativeOrganizationInvitations: boolean;
  /** 邮箱域 JIT 自动入组 */
  emailDomainJit: boolean;
  /** 每组织企业 SSO 连接器（BYO IdP） */
  perOrganizationSso: boolean;
  /** 组织 Token / 组织级 API 资源（访问控制主机制） */
  organizationTokens: boolean;
}
