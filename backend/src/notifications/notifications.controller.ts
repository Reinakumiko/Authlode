import { Controller, Get, Patch, Param, HttpException, HttpStatus } from '@nestjs/common';
import { TenantContextService } from '../tenant/tenant-context.service';
import { NotificationRepository } from './notification.repository';

@Controller('api/notifications')
export class NotificationsController {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly repository: NotificationRepository,
  ) {}

  @Get()
  async list() {
    const ctx = this.tenantContext.get();
    if (!ctx?.userId) return { data: [], totalCount: 0 };
    const data = await this.repository.findAll({ where: { userId: ctx.userId }, orderBy: { createdAt: 'desc' } });
    return { data, totalCount: data.length };
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    try { await this.repository.update(id, { read: true, readAt: new Date() }); return { success: true }; }
    catch (e) { throw new HttpException('标记已读失败', 500); }
  }
}
