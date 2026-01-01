import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from '../../common/repositories/base.repository';
import {
  UserExtend,
  PrismaTypes,
} from '../../prisma-types';

export type CreateUserExtendInput = PrismaTypes.UserExtendCreateInput;
export type UpdateUserExtendInput = PrismaTypes.UserExtendUpdateInput;

@Injectable()
export class UserExtendRepository extends BaseRepository<
  UserExtend,
  CreateUserExtendInput,
  UpdateUserExtendInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'userExtend');
  }

  /**
   * 根据 employeeId 查找用户扩展信息
   */
  async findByEmployeeId(employeeId: string): Promise<UserExtend | null> {
    try {
      const result = await this.prisma.userExtend.findUnique({
        where: { employeeId },
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to find user extend by employeeId: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 根据部门查找用户
   */
  async findByDepartment(
    department: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<{ data: UserExtend[]; total: number }> {
    return this.findPaginated({
      ...params,
      where: { department },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 根据经理 ID 查找下属用户
   */
  async findByManagerId(
    managerId: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<{ data: UserExtend[]; total: number }> {
    return this.findPaginated({
      ...params,
      where: { managerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 批量根据用户 ID 查找扩展信息
   */
  async findByIds(userIds: string[]): Promise<Map<string, UserExtend>> {
    try {
      const results = await this.prisma.userExtend.findMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      });

      const map = new Map<string, UserExtend>();
      results.forEach((userExtend: UserExtend) => {
        map.set(userExtend.userId, userExtend);
      });

      return map;
    } catch (error) {
      this.logger.error(
        `Failed to find user extends by ids: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 根据风险等级查找用户
   */
  async findByRiskLevel(
    riskLevel: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<{ data: UserExtend[]; total: number }> {
    return this.findPaginated({
      ...params,
      where: { riskLevel },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 搜索用户扩展信息
   */
  async search(
    keyword: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<{ data: UserExtend[]; total: number }> {
    return this.findPaginated({
      ...params,
      where: {
        OR: [
          { employeeId: { contains: keyword, mode: 'insensitive' } },
          { department: { contains: keyword, mode: 'insensitive' } },
          { position: { contains: keyword, mode: 'insensitive' } },
          { workPhone: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 根据 userId 更新或创建用户扩展信息
   */
  async upsertByUserId(
    userId: string,
    data: Omit<CreateUserExtendInput, 'userId'>,
  ): Promise<UserExtend> {
    try {
      const result = await this.prisma.userExtend.upsert({
        where: { userId },
        create: {
          userId,
          ...data,
        } as CreateUserExtendInput,
        update: data,
      });
      this.logger.log(`Upserted user extend for user: ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to upsert user extend: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 更新用户最后登录信息
   */
  async updateLastLogin(
    userId: string,
    ipAddress: string,
    location?: string,
  ): Promise<UserExtend> {
    try {
      const result = await this.prisma.userExtend.update({
        where: { userId },
        data: {
          lastLoginIp: ipAddress,
          lastLoginLocation: location,
        },
      });
      this.logger.log(`Updated last login for user: ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update last login: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 更新用户资料完成状态
   */
  async updateProfileCompletion(
    userId: string,
    completed: boolean,
  ): Promise<UserExtend> {
    try {
      const result = await this.prisma.userExtend.update({
        where: { userId },
        data: {
          profileCompleted: completed,
        },
      });
      this.logger.log(
        `Updated profile completion for user: ${userId} to ${completed}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update profile completion: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 更新用户风险等级
   */
  async updateRiskLevel(
    userId: string,
    riskLevel: string,
  ): Promise<UserExtend> {
    try {
      const result = await this.prisma.userExtend.update({
        where: { userId },
        data: { riskLevel },
      });
      this.logger.log(`Updated risk level for user: ${userId} to ${riskLevel}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update risk level: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取部门统计
   */
  async getDepartmentStats(): Promise<
    { department: string; count: number }[]
  > {
    try {
      const userExtends = await this.prisma.userExtend.findMany({
        where: {
          department: {
            not: null,
          },
        },
        select: { department: true },
      });

      const stats = new Map<string, number>();
      userExtends.forEach((userExtend: UserExtend) => {
        if (userExtend.department) {
          const count = stats.get(userExtend.department) || 0;
          stats.set(userExtend.department, count + 1);
        }
      });

      return Array.from(stats.entries())
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      this.logger.error(
        `Failed to get department stats: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 获取用户统计
   */
  async getUserStats(): Promise<{
    total: number;
    withEmployeeId: number;
    withDepartment: number;
    withPosition: number;
    profileCompleted: number;
    riskLevelDistribution: Record<string, number>;
  }> {
    try {
      const [
        total,
        withEmployeeId,
        withDepartment,
        withPosition,
        profileCompleted,
        allUsers,
      ] = await Promise.all([
        this.prisma.userExtend.count(),
        this.prisma.userExtend.count({
          where: { employeeId: { not: null } },
        }),
        this.prisma.userExtend.count({
          where: { department: { not: null } },
        }),
        this.prisma.userExtend.count({
          where: { position: { not: null } },
        }),
        this.prisma.userExtend.count({
          where: { profileCompleted: true },
        }),
        this.prisma.userExtend.findMany({
          select: { riskLevel: true },
        }),
      ]);

      const riskLevelDistribution: Record<string, number> = {};
      allUsers.forEach((user: UserExtend) => {
        const level = user.riskLevel || 'unknown';
        riskLevelDistribution[level] =
          (riskLevelDistribution[level] || 0) + 1;
      });

      return {
        total,
        withEmployeeId,
        withDepartment,
        withPosition,
        profileCompleted,
        riskLevelDistribution,
      };
    } catch (error) {
      this.logger.error(`Failed to get user stats: ${error.message}`);
      throw error;
    }
  }
}
