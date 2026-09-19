import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationRepository } from './notification.repository';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationRepository],
})
export class NotificationsModule {}
