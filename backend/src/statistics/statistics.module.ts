import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { LogtoModule } from '../logto/logto.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [LogtoModule, AuditLogsModule, PrismaModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
