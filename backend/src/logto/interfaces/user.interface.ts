/**
 * Logto User Interface Definitions
 * 基于 Logto Management API - User 相关接口
 */

// 用户基础信息
export interface User {
  id: string;
  username?: string;
  primaryEmail: string;
  primaryPhone?: string;
  name?: string;
  avatar?: string;
  profile?: {
    familyName?: string;
    givenName?: string;
    middleName?: string;
    nickname?: string;
    preferredUsername?: string;
    profile?: string;
    website?: string;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
    address?: {
      formatted?: string;
      streetAddress?: string;
      locality?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    };
  };
  identities?: {
    userId: string;
    details: Record<string, unknown>;
  }[];
  /**
   * @format date-time
   */
  createdAt: string;
  /**
   * @format date-time
   */
  updatedAt: string;
  deletedAt?: string;
  hasPassword: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  isSuspended: boolean;
  applicationId?: string;
  organizationId?: string;
  ssoIdentities?: {
    provider: string;
    userId: string;
    tenantId?: string;
    detail: Record<string, unknown>;
  }[];
}

// 创建用户 DTO
export interface CreateUserDto {
  username?: string;
  password: string;
  primaryEmail?: string;
  primaryPhone?: string;
  name?: string;
  profile?: {
    familyName?: string;
    givenName?: string;
    middleName?: string;
    nickname?: string;
    preferredUsername?: string;
    profile?: string;
    website?: string;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
    address?: Record<string, unknown>;
  };
  customData?: Record<string, unknown>;
}

// 更新用户 DTO
export interface UpdateUserDto {
  username?: string;
  password?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  name?: string;
  avatar?: string;
  profile?: {
    familyName?: string;
    givenName?: string;
    middleName?: string;
    nickname?: string;
    preferredUsername?: string;
    profile?: string;
    website?: string;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
    address?: Record<string, unknown>;
  };
  customData?: Record<string, unknown>;
}

// 用户查询参数
export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isSuspended?: boolean;
}

// 用户列表响应
export interface UserListResponse {
  totalCount: number;
  data: User[];
}

// 验证用户身份
export interface VerifyUserPasswordDto {
  password: string;
}

// 用户邮箱验证
export interface UserEmailVerificationDto {
  email?: string;
  expirationHour?: number;
}
