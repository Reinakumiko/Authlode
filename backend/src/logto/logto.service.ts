import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
  UserListResponse,
  VerifyUserPasswordDto,
  UserEmailVerificationDto,
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  AddOrganizationUserDto,
  OrganizationUserQueryParams,
  OrganizationUserListResponse,
  OrganizationTreeNode,
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  RoleQueryParams,
  RoleListResponse,
  AssignRoleToUserDto,
  Application,
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationQueryParams,
  ApplicationListResponse,
} from './interfaces';

@Injectable()
export class LogtoService {
  private readonly logger = new Logger(LogtoService.name);
  private readonly apiEndpoint: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiEndpoint = this.configService.get<string>(
      'LOGTO_MANAGEMENT_API_ENDPOINT',
    )!;
    this.apiKey = this.configService.get<string>(
      'LOGTO_MANAGEMENT_API_KEY',
    )!;

    if (!this.apiEndpoint || !this.apiKey) {
      throw new Error(
        'Logto API endpoint and API key must be configured in environment variables',
      );
    }
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  // ============================================
  // User API - 用户管理
  // ============================================

  /**
   * 获取用户列表
   */
  async getUsers(params?: UserQueryParams): Promise<UserListResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.apiEndpoint}/users`, {
            headers: this.headers,
            params: {
              page: params?.page ?? 1,
              page_size: params?.pageSize ?? 20,
              search: params?.search,
              emailVerified: params?.emailVerified,
              phoneVerified: params?.phoneVerified,
              isSuspended: params?.isSuspended,
            },
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully fetched user list`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID获取用户详情
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.apiEndpoint}/users/${userId}`, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully fetched user: ${userId}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch user ${userId}: ${error.message}`);
      throw new NotFoundException(`User ${userId} not found`);
    }
  }

  /**
   * 创建用户
   */
  async createUser(data: CreateUserDto): Promise<User> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(`${this.apiEndpoint}/users`, data, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully created user: ${response.id}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新用户
   */
  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .patch(`${this.apiEndpoint}/users/${userId}`, data, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully updated user: ${userId}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to update user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService
          .delete(`${this.apiEndpoint}/users/${userId}`, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully deleted user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 验证用户密码
   */
  async verifyUserPassword(
    userId: string,
    data: VerifyUserPasswordDto,
  ): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(
            `${this.apiEndpoint}/users/${userId}/verify-password`,
            data,
            {
              headers: this.headers,
            },
          )
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully verified password for user: ${userId}`);
      return response.valid;
    } catch (error) {
      this.logger.error(
        `Failed to verify password for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 发送用户邮箱验证
   */
  async sendUserEmailVerification(
    userId: string,
    data?: UserEmailVerificationDto,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService
          .post(
            `${this.apiEndpoint}/users/${userId}/verification-email`,
            data ?? {},
            {
              headers: this.headers,
            },
          )
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully sent verification email to user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  // ============================================
  // Organization API - 组织管理
  // ============================================

  /**
   * 获取组织列表
   */
  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.apiEndpoint}/organizations`, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully fetched organizations`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch organizations: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID获取组织详情
   */
  async getOrganizationById(organizationId: string): Promise<Organization> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.apiEndpoint}/organizations/${organizationId}`, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully fetched organization: ${organizationId}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch organization ${organizationId}: ${error.message}`,
      );
      throw new NotFoundException(`Organization ${organizationId} not found`);
    }
  }

  /**
   * 创建组织
   */
  async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(`${this.apiEndpoint}/organizations`, data, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully created organization: ${response.id}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to create organization: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新组织
   */
  async updateOrganization(
    organizationId: string,
    data: UpdateOrganizationDto,
  ): Promise<Organization> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .patch(
            `${this.apiEndpoint}/organizations/${organizationId}`,
            data,
            {
              headers: this.headers,
            },
          )
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully updated organization: ${organizationId}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to update organization ${organizationId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 删除组织
   */
  async deleteOrganization(organizationId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService
          .delete(`${this.apiEndpoint}/organizations/${organizationId}`, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully deleted organization: ${organizationId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete organization ${organizationId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 获取组织用户列表
   */
  async getOrganizationUsers(
    params: OrganizationUserQueryParams,
  ): Promise<OrganizationUserListResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(
            `${this.apiEndpoint}/organizations/${params.organizationId}/users`,
            {
              headers: this.headers,
              params: {
                page: params.page ?? 1,
                page_size: params.pageSize ?? 20,
              },
            },
          )
          .pipe(map((res) => res.data)),
      );

      this.logger.log(
        `Successfully fetched users for organization: ${params.organizationId}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch users for organization ${params.organizationId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 添加用户到组织
   */
  async addOrganizationUser(data: AddOrganizationUserDto): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService
          .post(
            `${this.apiEndpoint}/organizations/${data.organizationId}/users`,
            {
              userId: data.userId,
              organizationRoleIds: data.organizationRoleIds ?? [],
            },
            {
              headers: this.headers,
            },
          )
          .pipe(map((res) => res.data)),
      );

      this.logger.log(
        `Successfully added user ${data.userId} to organization ${data.organizationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to add user to organization: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 从组织移除用户
   */
  async removeOrganizationUser(
    organizationId: string,
    userId: string,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService
          .delete(
            `${this.apiEndpoint}/organizations/${organizationId}/users/${userId}`,
            {
              headers: this.headers,
            },
          )
          .pipe(map((res) => res.data)),
      );

      this.logger.log(
        `Successfully removed user ${userId} from organization ${organizationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove user from organization: ${error.message}`,
      );
      throw error;
    }
  }

  // ============================================
  // Role API - 角色管理
  // ============================================

  /**
   * 获取角色列表
   */
  async getRoles(params?: RoleQueryParams): Promise<RoleListResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.apiEndpoint}/roles`, {
            headers: this.headers,
            params: {
              page: params?.page ?? 1,
              page_size: params?.pageSize ?? 20,
              search: params?.search,
            },
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully fetched roles`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch roles: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID获取角色详情
   */
  async getRoleById(roleId: string): Promise<Role> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.apiEndpoint}/roles/${roleId}`, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully fetched role: ${roleId}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch role ${roleId}: ${error.message}`);
      throw new NotFoundException(`Role ${roleId} not found`);
    }
  }

  /**
   * 创建角色
   */
  async createRole(data: CreateRoleDto): Promise<Role> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(`${this.apiEndpoint}/roles`, data, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully created role: ${response.id}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to create role: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新角色
   */
  async updateRole(roleId: string, data: UpdateRoleDto): Promise<Role> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .patch(`${this.apiEndpoint}/roles/${roleId}`, data, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully updated role: ${roleId}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to update role ${roleId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除角色
   */
  async deleteRole(roleId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService
          .delete(`${this.apiEndpoint}/roles/${roleId}`, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully deleted role: ${roleId}`);
    } catch (error) {
      this.logger.error(`Failed to delete role ${roleId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 分配角色给用户
   */
  async assignRoleToUser(data: AssignRoleToUserDto): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService
          .post(
            `${this.apiEndpoint}/roles/${data.roleIds[0]}/users`,
            {
              userIds: [data.userId],
            },
            {
              headers: this.headers,
            },
          )
          .pipe(map((res) => res.data)),
      );

      this.logger.log(
        `Successfully assigned roles to user: ${data.userId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to assign roles to user: ${error.message}`);
      throw error;
    }
  }

  /**
   * 从用户移除角色
   */
  async removeRoleFromUser(roleId: string, userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService
          .delete(`${this.apiEndpoint}/roles/${roleId}/users/${userId}`, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully removed role ${roleId} from user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to remove role from user: ${error.message}`);
      throw error;
    }
  }

  // ============================================
  // Application API - 应用管理
  // ============================================

  /**
   * 获取应用列表
   */
  async getApplications(
    params?: ApplicationQueryParams,
  ): Promise<ApplicationListResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.apiEndpoint}/applications`, {
            headers: this.headers,
            params: {
              page: params?.page ?? 1,
              page_size: params?.pageSize ?? 20,
              search: params?.search,
            },
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully fetched applications`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to fetch applications: ${error.message}`);
      throw error;
    }
  }

  /**
   * 根据ID获取应用详情
   */
  async getApplicationById(applicationId: string): Promise<Application> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.apiEndpoint}/applications/${applicationId}`, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully fetched application: ${applicationId}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch application ${applicationId}: ${error.message}`,
      );
      throw new NotFoundException(`Application ${applicationId} not found`);
    }
  }

  /**
   * 创建应用
   */
  async createApplication(data: CreateApplicationDto): Promise<Application> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(`${this.apiEndpoint}/applications`, data, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully created application: ${response.id}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to create application: ${error.message}`);
      throw error;
    }
  }

  /**
   * 更新应用
   */
  async updateApplication(
    applicationId: string,
    data: UpdateApplicationDto,
  ): Promise<Application> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .patch(
            `${this.apiEndpoint}/applications/${applicationId}`,
            data,
            {
              headers: this.headers,
            },
          )
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully updated application: ${applicationId}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to update application ${applicationId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 删除应用
   */
  async deleteApplication(applicationId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService
          .delete(`${this.apiEndpoint}/applications/${applicationId}`, {
            headers: this.headers,
          })
          .pipe(map((res) => res.data)),
      );

      this.logger.log(`Successfully deleted application: ${applicationId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete application ${applicationId}: ${error.message}`,
      );
      throw error;
    }
  }
}
