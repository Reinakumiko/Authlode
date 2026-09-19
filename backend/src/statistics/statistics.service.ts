import { Injectable, Logger, Inject } from '@nestjs/common';
import { IAM_PROVIDER } from '../iam/interfaces';
import type { IamProviderInterface } from '../iam/interfaces';
import { AuditLogRepository } from '../audit-logs/repositories/audit-log.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @Inject(IAM_PROVIDER) private readonly iamProvider: IamProviderInterface,
    private readonly auditLogRepository: AuditLogRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 获取总览数据
   * 返回用户总数、组织总数、活跃会话数
   *
   * 注：Logto 列表端点不返回全量计数（无 x-total-count 头），
   * 此处以 pageSize=100 页内计数近似；批次 B4.3 统计租户化时改为扩展库计数。
   */
  async getOverview() {
    try {
      const [users, organizations] = await Promise.all([
        this.iamProvider.getUsers({ page: 1, pageSize: 100 }),
        this.iamProvider.getOrganizations({ page: 1, pageSize: 100 }),
      ]);

      return {
        totalUsers: users.totalCount,
        totalOrganizations: organizations.totalCount,
        activeSessions: 0, // TODO: 会话数据接入（批次 B4.3）
      };
    } catch (error) {
      this.logger.error(`Failed to get overview: ${(error as Error).message}`);
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
      this.logger.error(`Failed to get growth data: ${(error as Error).message}`);
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
      this.logger.error(`Failed to get activity data: ${(error as Error).message}`);
      throw error;
    }
  }
}
