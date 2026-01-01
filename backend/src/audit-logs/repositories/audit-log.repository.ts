import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from '../../common/repositories/base.repository';
import {
  AuditLog,
  PrismaTypes,
} from '../../prisma-types';

export type CreateAuditLogInput = PrismaTypes.AuditLogCreateInput;
export type UpdateAuditLogInput = PrismaTypes.AuditLogUpdateInput;

@Injectable()
export class AuditLogRepository extends BaseRepository<
  AuditLog,
  CreateAuditLogInput,
  UpdateAuditLogInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'auditLog');
  }

  /**
   * 根据用户 ID 查找审计日志
   */
  async findByUserId(
    userId: string,
    params?: {
      page?: number;
      pageSize?: number;
      action?: string;
      resource?: string;
    },
  ): Promise<{ data: AuditLog[]; total: number }> {
    const where: PrismaTypes.AuditLogWhereInput = {
      userId,
      ...(params?.action && { action: { contains: params.action, mode: 'insensitive' } }),
      ...(params?.resource && { resource: { contains: params.resource, mode: 'insensitive' } }),
    };

    return this.findPaginated({
      ...params,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 根据操作类型查找审计日志
   */
  async findByAction(
    action: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<{ data: AuditLog[]; total: number }> {
    return this.findPaginated({
      ...params,
      where: {
        action: { contains: action, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 根据资源类型查找审计日志
   */
  async findByResource(
    resource: string,
    resourceId?: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<{ data: AuditLog[]; total: number }> {
    const where: PrismaTypes.AuditLogWhereInput = {
      resource: { contains: resource, mode: 'insensitive' },
      ...(resourceId && { resourceId }),
    };

    return this.findPaginated({
      ...params,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 根据时间范围查找审计日志
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    params?: {
      page?: number;
      pageSize?: number;
      userId?: string;
    },
  ): Promise<{ data: AuditLog[]; total: number }> {
    const where: PrismaTypes.AuditLogWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      ...(params?.userId && { userId: params.userId }),
    };

    return this.findPaginated({
      ...params,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 查找失败的审计日志
   */
  async findFailedLogs(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<{ data: AuditLog[]; total: number }> {
    return this.findPaginated({
      ...params,
      where: { success: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 搜索审计日志
   */
  async search(
    keyword: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<{ data: AuditLog[]; total: number }> {
    return this.findPaginated({
      ...params,
      where: {
        OR: [
          { userName: { contains: keyword, mode: 'insensitive' } },
          { action: { contains: keyword, mode: 'insensitive' } },
          { resource: { contains: keyword, mode: 'insensitive' } },
          { resourceName: { contains: keyword, mode: 'insensitive' } },
          { errorMessage: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取审计日志统计
   */
  async getAuditStats(params?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }): Promise<{
    total: number;
    successCount: number;
    failureCount: number;
    successRate: number;
  }> {
    const where: PrismaTypes.AuditLogWhereInput = {
      ...(params?.startDate &&
        params?.endDate && {
        createdAt: {
          gte: params.startDate,
          lte: params.endDate,
        },
      }),
      ...(params?.userId && { userId: params.userId }),
    };

    try {
      const [total, successCount, failureCount] = await Promise.all([
        this.prisma.auditLog.count({ where }),
        this.prisma.auditLog.count({
          where: { ...where, success: true },
        }),
        this.prisma.auditLog.count({
          where: { ...where, success: false },
        }),
      ]);

      const successRate = total > 0 ? (successCount / total) * 100 : 0;

      return {
        total,
        successCount,
        failureCount,
        successRate,
      };
    } catch (error) {
      this.logger.error(`Failed to get audit stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取操作类型统计
   */
  async getActionStats(params?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ action: string; count: number }[]> {
    const where: PrismaTypes.AuditLogWhereInput = {
      ...(params?.startDate &&
        params?.endDate && {
        createdAt: {
          gte: params.startDate,
          lte: params.endDate,
        },
      }),
    };

    try {
      const logs = await this.prisma.auditLog.findMany({
        where,
        select: { action: true },
      });

      const stats = new Map<string, number>();
      logs.forEach((log: any) => {
        const count = stats.get(log.action) || 0;
        stats.set(log.action, count + 1);
      });

      return Array.from(stats.entries())
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      this.logger.error(`Failed to get action stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * 清理旧的审计日志
   */
  async cleanupOldLogs(daysToKeep: number): Promise<{ count: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old audit logs`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to cleanup old logs: ${error.message}`);
      throw error;
    }
  }
}
