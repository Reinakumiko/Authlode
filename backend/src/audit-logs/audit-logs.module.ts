import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogRepository } from './repositories/audit-log.repository';

@Module({
  providers: [AuditLogsService, AuditLogRepository],
  exports: [AuditLogsService, AuditLogRepository],
})
export class AuditLogsModule {}
