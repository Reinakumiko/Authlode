import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  IamApplication, IamApplicationType, IamCapabilities, IamCreateApplication,
  IamCreateOrganization, IamCreateOrgRole, IamCreateRole, IamCreateUser,
  IamOidcEndpoints, IamOrganization, IamOrganizationUser, IamOrgRole,
  IamPageQuery, IamPagedResult, IamRole, IamUpdateApplication,
  IamUpdateOrganization, IamUpdateRole, IamUpdateUser, IamUser,
  IamUserOrganization, IamUserQuery,
} from '../interfaces';

/**
 * MemoryAdapter — 内置引擎，零外部依赖
 *
 * 用户/组织/角色/应用全存扩展库（SQLite），不依赖 Logto 或任何外部 IAM。
 * 密码用 bcrypt 哈希。适合开发环境和小规模部署。
 */
@Injectable()
export class MemoryAdapter {
  constructor(private readonly prisma: PrismaService) {}

  getCapabilities(): IamCapabilities {
    return {
      organizationRoles: true,
      userOrganizationsQuery: true,
      createUserWithPassword: true,
      organizationCustomData: true,
      nativeOrganizationInvitations: false,
      emailDomainJit: false,
      perOrganizationSso: false,
      organizationTokens: false,
    };
  }

  // ═════════════════════════════ 用户 ═════════════════════════════

  async getUsers(query?: IamUserQuery): Promise<IamPagedResult<IamUser>> {
    const where: Record<string, unknown> = {};
    if (query?.search) {
      where.OR = [
        { username: { contains: query.search } },
        { primaryEmail: { contains: query.search } },
        { name: { contains: query.search } },
      ];
    }
    if (query?.isSuspended !== undefined) where.isSuspended = query.isSuspended;

    const [data, totalCount] = await Promise.all([
      this.prisma.iamUser.findMany({
        where,
        skip: ((query?.page ?? 1) - 1) * (query?.pageSize ?? 20),
        take: query?.pageSize ?? 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.iamUser.count({ where }),
    ]);
    return { data: data.map(u => this.mapUser(u)), totalCount };
  }

  async getUserById(userId: string): Promise<IamUser> {
    const user = await this.prisma.iamUser.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    return this.mapUser(user);
  }

  async getUserByEmail(email: string): Promise<IamUser | null> {
    const user = await this.prisma.iamUser.findUnique({ where: { primaryEmail: email } });
    return user ? this.mapUser(user) : null;
  }

  async createUser(data: { username?: string; primaryEmail?: string; name?: string; password?: string }): Promise<IamUser> {
    if (data.primaryEmail) {
      const existing = await this.prisma.iamUser.findUnique({ where: { primaryEmail: data.primaryEmail } });
      if (existing) throw new ConflictException(`Email ${data.primaryEmail} already in use`);
    }
    if (data.username) {
      const existing = await this.prisma.iamUser.findUnique({ where: { username: data.username } });
      if (existing) throw new ConflictException(`Username ${data.username} already in use`);
    }
    const user = await this.prisma.iamUser.create({
      data: {
        username: data.username,
        primaryEmail: data.primaryEmail,
        name: data.name,
        passwordHash: data.password ? await bcrypt.hash(data.password, 10) : null,
      },
    });
    return this.mapUser(user);
  }

  async updateUser(userId: string, data: IamUpdateUser): Promise<IamUser> {
    const user = await this.prisma.iamUser.update({
      where: { id: userId },
      data: {
        username: data.username,
        primaryEmail: data.primaryEmail,
        name: data.name,
        avatar: data.avatar,
        isSuspended: data.isSuspended,
      },
    });
    return this.mapUser(user);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.prisma.iamUser.delete({ where: { id: userId } });
  }

  async updateUserPassword(userId: string, password: string): Promise<void> {
    await this.prisma.iamUser.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(password, 10) },
    });
  }

  /** 验证密码（内置认证用） */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.prisma.iamUser.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) return false;
    return bcrypt.compare(password, user.passwordHash);
  }

  // ═════════════════════════════ 租户 ═════════════════════════════

  async getOrganizations(query?: IamPageQuery): Promise<IamPagedResult<IamOrganization>> {
    const [data, totalCount] = await Promise.all([
      this.prisma.iamOrganization.findMany({
        skip: ((query?.page ?? 1) - 1) * (query?.pageSize ?? 20),
        take: query?.pageSize ?? 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.iamOrganization.count(),
    ]);
    return { data: data.map(o => this.mapOrg(o)), totalCount };
  }

  async createOrganization(data: IamCreateOrganization): Promise<IamOrganization> {
    const org = await this.prisma.iamOrganization.create({
      data: {
        name: data.name,
        description: data.description,
        customData: data.customData ? JSON.stringify(data.customData) : null,
      },
    });
    return this.mapOrg(org);
  }

  async getOrganizationById(orgId: string): Promise<IamOrganization> {
    const org = await this.prisma.iamOrganization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException(`Organization ${orgId} not found`);
    return this.mapOrg(org);
  }

  async updateOrganization(orgId: string, data: IamUpdateOrganization): Promise<IamOrganization> {
    const org = await this.prisma.iamOrganization.update({
      where: { id: orgId },
      data: {
        name: data.name,
        description: data.description,
        customData: data.customData ? JSON.stringify(data.customData) : undefined,
      },
    });
    return this.mapOrg(org);
  }

  async deleteOrganization(orgId: string): Promise<void> {
    await this.prisma.iamOrganization.delete({ where: { id: orgId } });
  }

  async getOrganizationUsers(orgId: string, query?: IamPageQuery): Promise<IamPagedResult<IamOrganizationUser>> {
    const memberships = await this.prisma.iamMembership.findMany({
      where: { organizationId: orgId },
      skip: ((query?.page ?? 1) - 1) * (query?.pageSize ?? 20),
      take: query?.pageSize ?? 20,
    });
    const userIds = memberships.map(m => m.userId);
    const users = await this.prisma.iamUser.findMany({ where: { id: { in: userIds } } });
    const userMap = new Map(users.map(u => [u.id, u]));
    const data = memberships
      .map(m => {
        const u = userMap.get(m.userId);
        if (!u) return null;
        return {
          userId: u.id,
          username: u.username,
          primaryEmail: u.primaryEmail,
          name: u.name,
          joinedAt: m.createdAt.toISOString(),
        };
      })
      .filter(Boolean) as IamOrganizationUser[];
    return { data, totalCount: memberships.length };
  }

  async addOrganizationUsers(orgId: string, userIds: string[], organizationRoleIds?: string[]): Promise<void> {
    for (const userId of userIds) {
      const existing = await this.prisma.iamMembership.findUnique({
        where: { userId_organizationId: { userId, organizationId: orgId } },
      });
      if (!existing) {
        await this.prisma.iamMembership.create({ data: { userId, organizationId: orgId } });
      }
      if (organizationRoleIds?.length) {
        for (const roleId of organizationRoleIds) {
          await this.assignUserOrganizationRoles(orgId, userId, [roleId]);
        }
      }
    }
  }

  async removeOrganizationUser(orgId: string, userId: string): Promise<void> {
    await this.prisma.iamMembership.deleteMany({
      where: { userId, organizationId: orgId },
    });
  }

  async getUserOrganizations(userId: string): Promise<IamUserOrganization[]> {
    const memberships = await this.prisma.iamMembership.findMany({
      where: { userId },
    });
    const orgIds = memberships.map(m => m.organizationId);
    const orgs = await this.prisma.iamOrganization.findMany({ where: { id: { in: orgIds } } });
    const orgMap = new Map(orgs.map(o => [o.id, o]));

    const result: IamUserOrganization[] = [];
    for (const m of memberships) {
      const org = orgMap.get(m.organizationId);
      if (!org) continue;
      const roles = await this.prisma.iamOrgRoleAssignment.findMany({
        where: { userId, organizationId: m.organizationId },
      });
      const roleIds = roles.map(r => r.roleId);
      const roleDefs = await this.prisma.iamOrgRole.findMany({ where: { id: { in: roleIds } } });
      result.push({
        organization: this.mapOrg(org),
        organizationRoles: roleDefs.map(r => ({ id: r.id, name: r.name, description: r.description })),
      });
    }
    return result;
  }

  // ═════════════════════════════ 组织角色 ═════════════════════════════

  async getOrganizationRoles(): Promise<IamOrgRole[]> {
    const roles = await this.prisma.iamOrgRole.findMany();
    return roles.map(r => ({ id: r.id, name: r.name, description: r.description }));
  }

  async createOrganizationRole(data: IamCreateOrgRole): Promise<IamOrgRole> {
    const role = await this.prisma.iamOrgRole.create({
      data: { name: data.name, description: data.description },
    });
    return { id: role.id, name: role.name, description: role.description };
  }

  async getUserOrganizationRoles(orgId: string, userId: string): Promise<IamOrgRole[]> {
    const assignments = await this.prisma.iamOrgRoleAssignment.findMany({
      where: { userId, organizationId: orgId },
    });
    const roleIds = assignments.map(a => a.roleId);
    const roles = await this.prisma.iamOrgRole.findMany({ where: { id: { in: roleIds } } });
    return roles.map(r => ({ id: r.id, name: r.name, description: r.description }));
  }

  async assignUserOrganizationRoles(orgId: string, userId: string, roleIds: string[]): Promise<void> {
    for (const roleId of roleIds) {
      const existing = await this.prisma.iamOrgRoleAssignment.findUnique({
        where: { userId_organizationId_roleId: { userId, organizationId: orgId, roleId } },
      });
      if (!existing) {
        await this.prisma.iamOrgRoleAssignment.create({
          data: { userId, organizationId: orgId, roleId },
        });
      }
    }
  }

  async removeUserOrganizationRole(orgId: string, userId: string, roleId: string): Promise<void> {
    await this.prisma.iamOrgRoleAssignment.deleteMany({
      where: { userId, organizationId: orgId, roleId },
    });
  }

  // ═════════════════════════════ 实例级角色 ═════════════════════════════

  async getRoles(query?: IamPageQuery): Promise<IamPagedResult<IamRole>> {
    const [data, totalCount] = await Promise.all([
      this.prisma.iamRole.findMany({
        skip: ((query?.page ?? 1) - 1) * (query?.pageSize ?? 20),
        take: query?.pageSize ?? 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.iamRole.count(),
    ]);
    return { data: data.map(r => ({ id: r.id, name: r.name, description: r.description, type: r.type })), totalCount };
  }

  async getRoleById(roleId: string): Promise<IamRole> {
    const role = await this.prisma.iamRole.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Role ${roleId} not found`);
    return { id: role.id, name: role.name, description: role.description, type: role.type };
  }

  async createRole(data: IamCreateRole): Promise<IamRole> {
    const role = await this.prisma.iamRole.create({
      data: { name: data.name, description: data.description },
    });
    return { id: role.id, name: role.name, description: role.description, type: role.type };
  }

  async updateRole(roleId: string, data: IamUpdateRole): Promise<IamRole> {
    const role = await this.prisma.iamRole.update({
      where: { id: roleId },
      data: { name: data.name, description: data.description },
    });
    return { id: role.id, name: role.name, description: role.description, type: role.type };
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.prisma.iamRole.delete({ where: { id: roleId } });
  }

  async assignRoleToUser(roleId: string, userId: string): Promise<void> {
    const existing = await this.prisma.iamRoleAssignment.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (!existing) {
      await this.prisma.iamRoleAssignment.create({ data: { userId, roleId } });
    }
  }

  async removeRoleFromUser(roleId: string, userId: string): Promise<void> {
    await this.prisma.iamRoleAssignment.deleteMany({ where: { userId, roleId } });
  }

  // ═════════════════════════════ 应用 ═════════════════════════════

  async getApplications(query?: IamPageQuery): Promise<IamPagedResult<IamApplication>> {
    const [data, totalCount] = await Promise.all([
      this.prisma.iamApplication.findMany({
        skip: ((query?.page ?? 1) - 1) * (query?.pageSize ?? 20),
        take: query?.pageSize ?? 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.iamApplication.count(),
    ]);
    return { data: data.map(a => this.mapApp(a)), totalCount };
  }

  async getApplicationById(appId: string): Promise<IamApplication> {
    const app = await this.prisma.iamApplication.findUnique({ where: { id: appId } });
    if (!app) throw new NotFoundException(`Application ${appId} not found`);
    return this.mapApp(app);
  }

  async createApplication(data: IamCreateApplication): Promise<IamApplication> {
    const secret = crypto.randomBytes(32).toString('hex');
    const app = await this.prisma.iamApplication.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        secret,
        redirectUris: JSON.stringify(data.redirectUris),
        postLogoutRedirectUris: JSON.stringify(data.postLogoutRedirectUris ?? []),
      },
    });
    return this.mapApp(app);
  }

  async updateApplication(appId: string, data: IamUpdateApplication): Promise<IamApplication> {
    const app = await this.prisma.iamApplication.update({
      where: { id: appId },
      data: {
        name: data.name,
        description: data.description,
        redirectUris: data.redirectUris ? JSON.stringify(data.redirectUris) : undefined,
        postLogoutRedirectUris: data.postLogoutRedirectUris ? JSON.stringify(data.postLogoutRedirectUris) : undefined,
      },
    });
    return this.mapApp(app);
  }

  async deleteApplication(appId: string): Promise<void> {
    await this.prisma.iamApplication.delete({ where: { id: appId } });
  }

  getOidcEndpoints(): IamOidcEndpoints {
    // MemoryAdapter 不提供 OIDC 端点（内置认证不走 OIDC）
    return {
      issuer: '',
      authorizationUrl: '',
      tokenUrl: '',
      jwksUri: '',
      userinfoUrl: '',
      endSessionUrl: '',
    };
  }

  // ═════════════════════════════ 内部 ═════════════════════════════

  private mapUser(u: {
    id: string; username: string | null; primaryEmail: string | null;
    name: string | null; avatar: string | null; isSuspended: boolean;
    createdAt: Date; updatedAt: Date;
  }): IamUser {
    return {
      id: u.id,
      username: u.username,
      primaryEmail: u.primaryEmail,
      name: u.name,
      avatar: u.avatar,
      isSuspended: u.isSuspended,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    };
  }

  private mapOrg(o: {
    id: string; name: string; description: string | null;
    customData: string | null; createdAt: Date;
  }): IamOrganization {
    return {
      id: o.id,
      name: o.name,
      description: o.description,
      customData: o.customData ? JSON.parse(o.customData) : undefined,
      createdAt: o.createdAt.toISOString(),
    };
  }

  private mapApp(a: {
    id: string; name: string; description: string | null;
    type: string; secret: string | null;
    redirectUris: string; postLogoutRedirectUris: string;
  }): IamApplication {
    return {
      id: a.id,
      name: a.name,
      description: a.description,
      type: (a.type as IamApplicationType) ?? 'spa',
      secret: a.secret,
      oidcClientMetadata: {
        redirectUris: JSON.parse(a.redirectUris || '[]'),
        postLogoutRedirectUris: JSON.parse(a.postLogoutRedirectUris || '[]'),
      },
    };
  }
}
