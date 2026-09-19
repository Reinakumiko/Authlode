import { Injectable } from '@nestjs/common';
import { Prisma, TenantOrganization } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from '../common/repositories/base.repository';
import { TenantContextService } from '../tenant/tenant-context.service';

@Injectable()
export class TenantOrganizationRepository extends BaseRepository<
  TenantOrganization, Prisma.TenantOrganizationCreateInput, Prisma.TenantOrganizationUpdateInput
> {
  constructor(prisma: PrismaService, tenantContext: TenantContextService) {
    super(prisma, 'tenantOrganization', tenantContext);
  }
}
