import { Injectable, Logger } from '@nestjs/common';
import { LogtoService } from '../logto/logto.service';
import { AuditLogRepository } from '../audit-logs/repositories/audit-log.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    private readonly logtoService: LogtoService,
    private readonly auditLogRepository: AuditLogRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 获取总览数据
   * 返回用户总数、组织总数、活跃会话数
   */
  async getOverview() {
    try {
      const [usersResponse, organizations] = await Promise.all([
        this.logtoService.getUsers({ page: 1, pageSize: 1 }),
        this.logtoService.getOrganizations(),
      ]);

      return {
        totalUsers: usersResponse.totalCount,
        totalOrganizations: organizations.length,
        activeSessions: 0, // TODO: 接入会话数据
      };
    } catch (error) {
      this.logger.error(`Failed to get overview: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取用户增长数据（最近 30 天）
   */
  async getGrowth() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const logs = await this.prisma.auditLog.findMany({
        where: {
          action: 'user.create',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      // 按日期聚合
      const dailyCounts = new Map<string, number>();
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0];
        dailyCounts.set(key, 0);
      }

      logs.forEach((log: { createdAt: Date }) => {
        const key = log.createdAt.toISOString().split('T')[0];
        dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
      });

      return Array.from(dailyCounts.entries()).map(([date, count]) => ({
        date,
        count,
      }));
    } catch (error) {
      this.logger.error(`Failed to get growth data: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取活动分类统计
   */
  async getActivity() {
    try {
      const actionStats = await this.auditLogRepository.getActionStats();
      return actionStats;
    } catch (error) {
      this.logger.error(`Failed to get activity data: ${error.message}`);
      throw error;
    }
  }
}
