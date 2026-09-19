import { Module } from '@nestjs/common';
import { TenantApplicationsController } from './tenant-applications.controller';
import { TenantApplicationRepository } from './tenant-application.repository';

@Module({
  controllers: [TenantApplicationsController],
  providers: [TenantApplicationRepository],
})
export class TenantApplicationsModule {}
