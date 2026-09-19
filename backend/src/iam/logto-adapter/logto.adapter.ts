import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IamConfigService } from '../iam.config';
import { LogtoTokenManager } from './logto-token.manager';
import type {
  IamApplication,
  IamApplicationType,
  IamCapabilities,
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
  IamProviderInterface,
  IamRole,
  IamUpdateApplication,
  IamUpdateOrganization,
  IamUpdateRole,
  IamUpdateUser,
  IamUser,
  IamUserOrganization,
  IamUserQuery,
} from '../interfaces';

/**
 * Logto Adapter — IamProviderInterface 的第一实现
 *
 * 端点分工（批次 0 实测）：
 * - Management API 调用 → default 租户（config.managementApiEndpoint）
 * - M2M token 交换 → admin 租户（TokenManager，F5）
 *
 * 已规避的坑（F7）：创建应用不传 tokenEndpointAuthMethod（Logto 会静默丢弃产生坏应用）；
 * postLogoutRedirectUris 必填。
 */
@Injectable()
export class LogtoAdapter implements IamProviderInterface {
  private readonly logger = new Logger(LogtoAdapter.name);

  constructor(
    private readonly iamConfigService: IamConfigService,
    private readonly tokenManager: LogtoTokenManager,
    private readonly httpService: HttpService,
  ) {}

  getCapabilities(): IamCapabilities {
    // Logto OSS 实测/调研结论（docs/功能模块集成与实现规划.md 第八节）
    return {
      organizationRoles: true,
      userOrganizationsQuery: true,
      createUserWithPassword: true,
      organizationCustomData: true,
      nativeOrganizationInvitations: true,
      emailDomainJit: true,
      perOrganizationSso: true,
      organizationTokens: true,
    };
  }

  // ════════════════════════════════ 用户 ════════════════════════════════

  async getUsers(query?: IamUserQuery): Promise<IamPagedResult<IamUser>> {
    const raw = await this.request<unknown[]>('GET', '/users', undefined, {
      page: query?.page ?? 1,
      page_size: query?.pageSize ?? 20,
      search: query?.search,
    });
    const users = (raw as Record<string, unknown>[]).map((u) => this.mapUser(u));
    return { data: users, totalCount: users.length };
  }

  async getUserById(userId: string): Promise<IamUser> {
    const raw = await this.request<Record<string, unknown>>('GET', `/users/${userId}`);
    return this.mapUser(raw);
  }

  async getUserByEmail(email: string): Promise<IamUser | null> {
    const raw = await this.request<unknown[]>('GET', '/users', undefined, {
      page: 1,
      page_size: 20,
      search: email,
    });
    const exact = (raw as Record<string, unknown>[]).find((u) => u.primaryEmail === email);
    return exact ? this.mapUser(exact) : null;
  }

  async createUser(data: IamCreateUser): Promise<IamUser> {
    const raw = await this.request<Record<string, unknown>>('POST', '/users', {
      username: data.username,
      primaryEmail: data.primaryEmail,
      primaryPhone: data.primaryPhone,
      name: data.name,
      password: data.password,
      passwordDigest: data.passwordDigest
        ? {
            digest: data.passwordDigest.digest,
            passwordEncryptionMethod: data.passwordDigest.algorithm,
          }
        : undefined,
      customData: data.customData,
    });
    return this.mapUser(raw);
  }

  async updateUser(userId: string, data: IamUpdateUser): Promise<IamUser> {
    const raw = await this.request<Record<string, unknown>>('PATCH', `/users/${userId}`, {
      username: data.username,
      primaryEmail: data.primaryEmail,
      primaryPhone: data.primaryPhone,
      name: data.name,
      avatar: data.avatar,
      isSuspended: data.isSuspended,
      customData: data.customData,
    });
    return this.mapUser(raw);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request('DELETE', `/users/${userId}`);
  }

  async updateUserPassword(userId: string, password: string): Promise<void> {
    await this.request('PATCH', `/users/${userId}/password`, { password });
  }

  // ═════════════════════════════ 租户（Organization）═════════════════════════════

  async getOrganizations(query?: IamPageQuery): Promise<IamPagedResult<IamOrganization>> {
    const raw = await this.request<unknown[]>('GET', '/organizations', undefined, {
      page: query?.page ?? 1,
      page_size: query?.pageSize ?? 20,
      q: query?.search,
    });
    const organizations = (raw as Record<string, unknown>[]).map((o) => this.mapOrganization(o));
    return { data: organizations, totalCount: organizations.length };
  }

  async createOrganization(data: IamCreateOrganization): Promise<IamOrganization> {
    const raw = await this.request<Record<string, unknown>>('POST', '/organizations', {
      name: data.name,
      description: data.description,
      customData: data.customData,
    });
    return this.mapOrganization(raw);
  }

  async getOrganizationById(orgId: string): Promise<IamOrganization> {
    const raw = await this.request<Record<string, unknown>>('GET', `/organizations/${orgId}`);
    return this.mapOrganization(raw);
  }

  async updateOrganization(
    orgId: string,
    data: IamUpdateOrganization,
  ): Promise<IamOrganization> {
    const raw = await this.request<Record<string, unknown>>('PATCH', `/organizations/${orgId}`, {
      name: data.name,
      description: data.description,
      customData: data.customData,
    });
    return this.mapOrganization(raw);
  }

  async deleteOrganization(orgId: string): Promise<void> {
    await this.request('DELETE', `/organizations/${orgId}`);
  }

  async getOrganizationUsers(
    orgId: string,
    query?: IamPageQuery,
  ): Promise<IamPagedResult<IamOrganizationUser>> {
    const raw = await this.request<unknown[]>('GET', `/organizations/${orgId}/users`, undefined, {
      page: query?.page ?? 1,
      page_size: query?.pageSize ?? 20,
      q: query?.search,
    });
    const users = (raw as Record<string, unknown>[]).map((u) => ({
      userId: String(u.id),
      username: (u.username as string) ?? null,
      primaryEmail: (u.primaryEmail as string) ?? null,
      name: (u.name as string) ?? null,
      joinedAt: (u.joinedAt as string) ?? undefined,
    }));
    return { data: users, totalCount: users.length };
  }

  async addOrganizationUsers(
    orgId: string,
    userIds: string[],
    organizationRoleIds?: string[],
  ): Promise<void> {
    // V5 实证：对已有成员幂等
    await this.request('POST', `/organizations/${orgId}/users`, {
      userIds,
      organizationRoleIds: organizationRoleIds ?? [],
    });
  }

  async removeOrganizationUser(orgId: string, userId: string): Promise<void> {
    await this.request('DELETE', `/organizations/${orgId}/users/${userId}`);
  }

  async getUserOrganizations(userId: string): Promise<IamUserOrganization[]> {
    const raw = await this.request<unknown[]>('GET', `/users/${userId}/organizations`);
    return (raw as Record<string, unknown>[]).map((o) => ({
      organization: this.mapOrganization(o),
      organizationRoles: ((o.organizationRoles as Record<string, unknown>[]) ?? []).map((r) =>
        this.mapOrgRole(r),
      ),
    }));
  }

  // ═════════════════════════════ 组织角色 ═════════════════════════════

  async getOrganizationRoles(): Promise<IamOrgRole[]> {
    const raw = await this.request<unknown[]>('GET', '/organization-roles');
    return (raw as Record<string, unknown>[]).map((r) => this.mapOrgRole(r));
  }

  async createOrganizationRole(data: IamCreateOrgRole): Promise<IamOrgRole> {
    const raw = await this.request<Record<string, unknown>>('POST', '/organization-roles', {
      name: data.name,
      description: data.description,
    });
    return this.mapOrgRole(raw);
  }

  async getUserOrganizationRoles(orgId: string, userId: string): Promise<IamOrgRole[]> {
    const raw = await this.request<unknown[]>(
      'GET',
      `/organizations/${orgId}/users/${userId}/roles`,
    );
    return (raw as Record<string, unknown>[]).map((r) => this.mapOrgRole(r));
  }

  async assignUserOrganizationRoles(
    orgId: string,
    userId: string,
    roleIds: string[],
  ): Promise<void> {
    await this.request('POST', `/organizations/${orgId}/users/${userId}/roles`, {
      organizationRoleIds: roleIds,
    });
  }

  async removeUserOrganizationRole(
    orgId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    await this.request('DELETE', `/organizations/${orgId}/users/${userId}/roles/${roleId}`);
  }

  // ═════════════════════════════ 实例级角色 ═════════════════════════════

  async getRoles(query?: IamPageQuery): Promise<IamPagedResult<IamRole>> {
    const raw = await this.request<unknown[]>('GET', '/roles', undefined, {
      page: query?.page ?? 1,
      page_size: query?.pageSize ?? 20,
      search: query?.search,
    });
    const roles = (raw as Record<string, unknown>[]).map((r) => this.mapRole(r));
    return { data: roles, totalCount: roles.length };
  }

  async getRoleById(roleId: string): Promise<IamRole> {
    const raw = await this.request<Record<string, unknown>>('GET', `/roles/${roleId}`);
    return this.mapRole(raw);
  }

  async createRole(data: IamCreateRole): Promise<IamRole> {
    const raw = await this.request<Record<string, unknown>>('POST', '/roles', {
      name: data.name,
      description: data.description,
    });
    return this.mapRole(raw);
  }

  async updateRole(roleId: string, data: IamUpdateRole): Promise<IamRole> {
    const raw = await this.request<Record<string, unknown>>('PATCH', `/roles/${roleId}`, {
      name: data.name,
      description: data.description,
    });
    return this.mapRole(raw);
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.request('DELETE', `/roles/${roleId}`);
  }

  async assignRoleToUser(roleId: string, userId: string): Promise<void> {
    await this.request('POST', `/roles/${roleId}/users`, { userIds: [userId] });
  }

  async removeRoleFromUser(roleId: string, userId: string): Promise<void> {
    await this.request('DELETE', `/roles/${roleId}/users/${userId}`);
  }

  // ═════════════════════════════ 应用（系统接入）═════════════════════════════

  async getApplications(query?: IamPageQuery): Promise<IamPagedResult<IamApplication>> {
    const raw = await this.request<unknown[]>('GET', '/applications', undefined, {
      page: query?.page ?? 1,
      page_size: query?.pageSize ?? 20,
      search: query?.search,
    });
    const apps = (raw as Record<string, unknown>[]).map((a) => this.mapApplication(a));
    return { data: apps, totalCount: apps.length };
  }

  async getApplicationById(appId: string): Promise<IamApplication> {
    const raw = await this.request<Record<string, unknown>>('GET', `/applications/${appId}`);
    return this.mapApplication(raw);
  }

  async createApplication(data: IamCreateApplication): Promise<IamApplication> {
    // F7 实测规避：不传 tokenEndpointAuthMethod（被静默丢弃会产生坏应用）
    const raw = await this.request<Record<string, unknown>>('POST', '/applications', {
      name: data.name,
      description: data.description,
      type: this.toLogtoApplicationType(data.type),
      oidcClientMetadata: {
        redirectUris: data.redirectUris,
        postLogoutRedirectUris: data.postLogoutRedirectUris ?? [],
      },
    });
    return this.mapApplication(raw);
  }

  async updateApplication(appId: string, data: IamUpdateApplication): Promise<IamApplication> {
    const raw = await this.request<Record<string, unknown>>('PATCH', `/applications/${appId}`, {
      name: data.name,
      description: data.description,
      oidcClientMetadata:
        data.redirectUris || data.postLogoutRedirectUris
          ? {
              ...(data.redirectUris ? { redirectUris: data.redirectUris } : {}),
              ...(data.postLogoutRedirectUris
                ? { postLogoutRedirectUris: data.postLogoutRedirectUris }
                : {}),
            }
          : undefined,
    });
    return this.mapApplication(raw);
  }

  async deleteApplication(appId: string): Promise<void> {
    await this.request('DELETE', `/applications/${appId}`);
  }

  // ═════════════════════════════ OIDC 端点 ═════════════════════════════

  getOidcEndpoints(): IamOidcEndpoints {
    const { oidcEndpoint } = this.iamConfigService.getConfig();
    const issuer = `${oidcEndpoint}/oidc`;
    return {
      issuer,
      authorizationUrl: `${issuer}/auth`,
      tokenUrl: `${issuer}/token`,
      jwksUri: `${issuer}/jwks`,
      userinfoUrl: `${issuer}/me`,
      endSessionUrl: `${issuer}/session/end`,
    };
  }

  // ═════════════════════════════ 内部 ═════════════════════════════

  private async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, unknown>,
  ): Promise<T> {
    const token = await this.tokenManager.getAccessToken();
    try {
      const response = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url: `${this.iamConfigService.getConfig().managementApiEndpoint}${path}`,
          data: body,
          params: Object.fromEntries(
            Object.entries(params ?? {}).filter(([, v]) => v !== undefined),
          ),
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error) {
      return this.handleRequestError(error, `${method} ${path}`);
    }
  }

  private handleRequestError(error: unknown, context: string): never {
    const status = (error as { response?: { status?: number } })?.response?.status;
    const message = (error as { response?: { data?: unknown } })?.response?.data;
    this.logger.error(`Logto API failed [${context}]: HTTP ${status} ${JSON.stringify(message)}`);
    if (status === 404) {
      throw new NotFoundException(`IAM resource not found (${context})`);
    }
    throw error;
  }

  private mapUser(raw: Record<string, unknown>): IamUser {
    return {
      id: String(raw.id),
      username: (raw.username as string) ?? null,
      primaryEmail: (raw.primaryEmail as string) ?? null,
      primaryPhone: (raw.primaryPhone as string) ?? null,
      name: (raw.name as string) ?? null,
      avatar: (raw.avatar as string) ?? null,
      isSuspended: (raw.isSuspended as boolean) ?? undefined,
      createdAt: raw.createdAt as string | undefined,
      updatedAt: raw.updatedAt as string | undefined,
      customData: raw.customData as Record<string, unknown> | undefined,
    };
  }

  private mapOrganization(raw: Record<string, unknown>): IamOrganization {
    return {
      id: String(raw.id),
      name: String(raw.name),
      description: (raw.description as string) ?? null,
      customData: raw.customData as Record<string, unknown> | undefined,
      createdAt: raw.createdAt as string | undefined,
    };
  }

  private mapOrgRole(raw: Record<string, unknown>): IamOrgRole {
    return {
      id: String(raw.id),
      name: String(raw.name),
      description: (raw.description as string) ?? null,
    };
  }

  private mapRole(raw: Record<string, unknown>): IamRole {
    return {
      id: String(raw.id),
      name: String(raw.name),
      description: (raw.description as string) ?? null,
      type: (raw.type as string) ?? null,
    };
  }

  private mapApplication(raw: Record<string, unknown>): IamApplication {
    const metadata = (raw.oidcClientMetadata ?? {}) as Record<string, unknown>;
    return {
      id: String(raw.id),
      name: String(raw.name),
      description: (raw.description as string) ?? null,
      type: this.fromLogtoApplicationType(String(raw.type)),
      secret: (raw.secret as string) ?? null,
      oidcClientMetadata: {
        redirectUris: (metadata.redirectUris as string[]) ?? [],
        postLogoutRedirectUris: (metadata.postLogoutRedirectUris as string[]) ?? [],
        tokenEndpointAuthMethod: (metadata.tokenEndpointAuthMethod as string) ?? null,
      },
    };
  }

  private toLogtoApplicationType(type: IamApplicationType): string {
    const mapping: Record<IamApplicationType, string> = {
      traditional: 'Traditional',
      spa: 'SPA',
      native: 'Native',
      m2m: 'MachineToMachine',
    };
    return mapping[type];
  }

  private fromLogtoApplicationType(type: string): IamApplicationType {
    const mapping: Record<string, IamApplicationType> = {
      Traditional: 'traditional',
      SPA: 'spa',
      Native: 'native',
      MachineToMachine: 'm2m',
    };
    return mapping[type] ?? 'traditional';
  }
}
