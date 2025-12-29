/**
 * Logto Application Interface Definitions
 * 基于 Logto Management API - Application 相关接口
 */

// 应用类型
export enum ApplicationType {
  Traditional = 'Traditional',
  Spa = 'SPA',
  Native = 'Native',
  MachineToMachine = 'Machine-to-Machine',
  Protected = 'Protected',
  ThirdParty = 'Third-party',
}

// 应用基础信息
export interface Application {
  id: string;
  name: string;
  description?: string;
  type: ApplicationType;
  secret: string;
  appId: string;
  oidcClientMetadata?: {
    redirectUris: string[];
    postLogoutRedirectUris: string[];
    scopes: string[];
    responseType: string[];
    grantTypes: string[];
    tokenEndpointAuthMethod?: string;
    dpop?: boolean;
    jwks?: string;
  };
  /**
   * @format date-time
   */
  createdAt: string;
  /**
   * @format date-time
   */
  updatedAt: string;
}

// 创建应用 DTO
export interface CreateApplicationDto {
  name: string;
  description?: string;
  type: ApplicationType;
  oidcClientMetadata?: {
    redirectUris: string[];
    postLogoutRedirectUris?: string[];
    scopes?: string[];
    responseType?: string[];
    grantTypes?: string[];
    tokenEndpointAuthMethod?: string;
    dpop?: boolean;
    jwks?: string;
  };
}

// 更新应用 DTO
export interface UpdateApplicationDto {
  name?: string;
  description?: string;
  oidcClientMetadata?: {
    redirectUris?: string[];
    postLogoutRedirectUris?: string[];
    scopes?: string[];
    responseType?: string[];
    grantTypes?: string[];
    tokenEndpointAuthMethod?: string;
    dpop?: boolean;
    jwks?: string;
  };
}

// 应用查询参数
export interface ApplicationQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// 应用列表响应
export interface ApplicationListResponse {
  totalCount: number;
  data: Application[];
}

// 应用组织关系
export interface ApplicationOrganizationRelation {
  id: string;
  applicationId: string;
  organizationId: string;
  /**
   * @format date-time
   */
  createdAt: string;
}

// 添加应用到组织 DTO
export interface AddApplicationToOrganizationDto {
  applicationId: string;
  organizationId: string[];
}
