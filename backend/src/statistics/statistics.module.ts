import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuditLogsModule, PrismaModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
