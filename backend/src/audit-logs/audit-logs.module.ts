import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AuditLogsController } from './audit-logs.controller';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService, AuditLogRepository],
  exports: [AuditLogsService, AuditLogRepository],
})
export class AuditLogsModule {}
