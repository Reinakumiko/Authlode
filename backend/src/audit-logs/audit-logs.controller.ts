import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogRepository } from './repositories/audit-log.repository';

@Controller('api/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  /**
   * 获取审计日志列表
   * 支持按用户、操作类型、时间范围筛选
   */
  @Get()
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    // 按时间范围筛选
    if (startDate && endDate) {
      return this.auditLogRepository.findByDateRange(
        new Date(startDate),
        new Date(endDate),
        { page, pageSize, userId },
      );
    }

    // 按用户筛选
    if (userId) {
      return this.auditLogRepository.findByUserId(userId, {
        page,
        pageSize,
        action,
      });
    }

    // 按操作类型筛选
    if (action) {
      return this.auditLogRepository.findByAction(action, { page, pageSize });
    }

    // 默认返回全部
    return this.auditLogRepository.findPaginated({
      page,
      pageSize,
      orderBy: { createdAt: 'desc' },
    });
  }
}
