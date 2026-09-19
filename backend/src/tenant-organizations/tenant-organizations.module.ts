import { Module } from '@nestjs/common';
import { TenantOrganizationsController } from './tenant-organizations.controller';
import { TenantOrganizationRepository } from './tenant-organization.repository';

@Module({
  controllers: [TenantOrganizationsController],
  providers: [TenantOrganizationRepository],
})
export class TenantOrganizationsModule {}
