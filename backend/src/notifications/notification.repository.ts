import { Injectable } from '@nestjs/common';
import { Prisma, UserNotification } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from '../common/repositories/base.repository';
import { TenantContextService } from '../tenant/tenant-context.service';

@Injectable()
export class NotificationRepository extends BaseRepository<
  UserNotification, Prisma.UserNotificationCreateInput, Prisma.UserNotificationUpdateInput
> {
  constructor(prisma: PrismaService, tenantContext: TenantContextService) {
    super(prisma, 'userNotification', tenantContext);
  }
}
