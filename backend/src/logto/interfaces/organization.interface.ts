/**
 * Logto Organization Interface Definitions
 * 基于 Logto Management API - Organization 相关接口
 */

// 组织基础信息
export interface Organization {
  id: string;
  name: string;
  description?: string;
  tenantId?: string;
  /**
   * @format date-time
   */
  createdAt: string;
  /**
   * @format date-time
   */
  updatedAt: string;
}

// 创建组织 DTO
export interface CreateOrganizationDto {
  name: string;
  description?: string;
  tenantId?: string;
}

// 更新组织 DTO
export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  tenantId?: string;
}

// 组织关系类型
export enum OrganizationRoleRelationType {
  User = 'user',
  Role = 'role',
}

// 组织成员
export interface OrganizationUserRelation {
  id: string;
  organizationId: string;
  organizationRoleRelationType: OrganizationRoleRelationType.User;
  userId: string;
  /**
   * @format date-time
   */
  createdAt: string;
}

// 组织角色
export interface OrganizationRoleRelation {
  id: string;
  organizationId: string;
  organizationRoleRelationType: OrganizationRoleRelationType.Role;
  roleId: string;
  /**
   * @format date-time
   */
  createdAt: string;
}

// 添加组织成员 DTO
export interface AddOrganizationUserDto {
  organizationId: string;
  userId: string;
  organizationRoleIds?: string[];
}

// 组织用户查询参数
export interface OrganizationUserQueryParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
}

// 组织用户列表响应
export interface OrganizationUserListResponse {
  totalCount: number;
  data: OrganizationUserRelation[];
}

// 组织树节点
export interface OrganizationTreeNode {
  id: string;
  name: string;
  description?: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
  children?: OrganizationTreeNode[];
}
