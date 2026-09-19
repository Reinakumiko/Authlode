import {
  Controller, Get, Post, Patch, Delete, Param, Body, Inject, UseGuards,
  HttpException, HttpStatus, ForbiddenException,
} from '@nestjs/common';
import { IAM_PROVIDER } from '../iam/interfaces';
import type { IamProviderInterface, IamOidcEndpoints } from '../iam/interfaces';
import { TenantContextService } from '../tenant/tenant-context.service';
import { TenantAdminGuard } from '../auth/tenant-admin.guard';
import { TenantApplicationRepository } from './tenant-application.repository';

@Controller('api/tenant-applications')
@UseGuards(TenantAdminGuard)
export class TenantApplicationsController {
  constructor(
    @Inject(IAM_PROVIDER) private readonly iamProvider: IamProviderInterface,
    private readonly tenantContext: TenantContextService,
    private readonly repository: TenantApplicationRepository,
  ) {}

  private requireTenantId(): string {
    const ctx = this.tenantContext.get();
    if (!ctx?.tenantId) throw new ForbiddenException('No tenant context');
    return ctx.tenantId;
  }

  @Get()
  async list() {
    try {
      const tenantId = this.requireTenantId();
      const [mappings, appsRes] = await Promise.all([
        this.repository.findAll(),
        this.iamProvider.getApplications({ pageSize: 100 }),
      ]);
      const endpoints = this.iamProvider.getOidcEndpoints();
      const appMap = new Map(appsRes.data.map(a => [a.id, a]));
      return {
        data: mappings.map(m => {
          const app = appMap.get(m.applicationId);
          return {
            id: m.id, applicationId: m.applicationId,
            name: app?.name ?? '未知应用', type: app?.type ?? 'spa',
            enabled: m.enabled, accessPolicy: m.accessPolicy,
            redirectUris: app?.oidcClientMetadata?.redirectUris ?? [],
            secret: app?.secret ?? null,
            endpoints,
          };
        }),
        totalCount: mappings.length,
      };
    } catch (e) { if (e instanceof HttpException) throw e; throw new HttpException('获取应用列表失败', 500); }
  }

  @Post()
  async create(@Body() body: { name: string; description?: string; type: 'spa' | 'traditional'; redirectUris: string[] }) {
    try {
      const tenantId = this.requireTenantId();
      const app = await this.iamProvider.createApplication({
        name: body.name, description: body.description, type: body.type, redirectUris: body.redirectUris,
      });
      await this.repository.create({ tenantId, applicationId: app.id });
      const endpoints = this.iamProvider.getOidcEndpoints();
      return { ...app, endpoints };
    } catch (e) { if (e instanceof HttpException) throw e; throw new HttpException('接入应用失败', 500); }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { enabled?: boolean; accessPolicy?: string }) {
    try {
      await this.repository.update(id, {
        ...(body.enabled !== undefined && { enabled: body.enabled }),
        ...(body.accessPolicy && { accessPolicy: body.accessPolicy }),
      });
      return { success: true };
    } catch (e) { if (e instanceof HttpException) throw e; throw new HttpException('更新应用失败', 500); }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try { await this.repository.delete(id); return { success: true }; }
    catch (e) { if (e instanceof HttpException) throw e; throw new HttpException('移除应用失败', 500); }
  }
}
