import { Injectable } from '@nestjs/common';
import { Prisma, TenantApplication } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from '../common/repositories/base.repository';
import { TenantContextService } from '../tenant/tenant-context.service';

@Injectable()
export class TenantApplicationRepository extends BaseRepository<
  TenantApplication, Prisma.TenantApplicationCreateInput, Prisma.TenantApplicationUpdateInput
> {
  constructor(prisma: PrismaService, tenantContext: TenantContextService) {
    super(prisma, 'tenantApplication', tenantContext);
  }
}
