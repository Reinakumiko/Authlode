/**
 * Logto Role Interface Definitions
 * 基于 Logto Management API - Role 相关接口
 */

// 角色基础信息
export interface Role {
  id: string;
  name: string;
  description?: string;
  /**
   * @format date-time
   */
  createdAt: string;
  /**
   * @format date-time
   */
  updatedAt: string;
}

// 创建角色 DTO
export interface CreateRoleDto {
  name: string;
  description?: string;
}

// 更新角色 DTO
export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

// 角色查询参数
export interface RoleQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// 角色列表响应
export interface RoleListResponse {
  totalCount: number;
  data: Role[];
}

// 用户角色关系
export interface UserRoleRelation {
  id: string;
  userId: string;
  roleId: string;
  /**
   * @format date-time
   */
  createdAt: string;
}

// 分配角色给用户 DTO
export interface AssignRoleToUserDto {
  userId: string;
  roleIds: string[];
}

// 权限定义
export interface Permission {
  id: string;
  name: string;
  description?: string;
  value: string;
  /**
   * @format date-time
   */
  createdAt: string;
  /**
   * @format date-time
   */
  updatedAt: string;
}

// 角色权限关系
export interface RolePermissionRelation {
  id: string;
  roleId: string;
  permissionId: string;
  /**
   * @format date-time
   */
  createdAt: string;
}

// 添加权限到角色 DTO
export interface AddPermissionToRoleDto {
  permissionIds: string[];
}
