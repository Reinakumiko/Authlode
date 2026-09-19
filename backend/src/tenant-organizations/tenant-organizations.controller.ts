import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards,
  HttpException, HttpStatus, ForbiddenException,
} from '@nestjs/common';
import { TenantContextService } from '../tenant/tenant-context.service';
import { TenantAdminGuard } from '../auth/tenant-admin.guard';
import { TenantOrganizationRepository } from './tenant-organization.repository';

@Controller('api/tenant-organizations')
export class TenantOrganizationsController {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly repository: TenantOrganizationRepository,
  ) {}

  private requireTenantId(): string {
    const ctx = this.tenantContext.get();
    if (!ctx?.tenantId) throw new ForbiddenException('No tenant context');
    return ctx.tenantId;
  }

  @Get()
  async list() {
    try {
      this.requireTenantId();
      const data = await this.repository.findAll({ orderBy: { createdAt: 'asc' } });
      return { data, totalCount: data.length };
    } catch (e) { if (e instanceof HttpException) throw e; throw new HttpException('获取组织列表失败', 500); }
  }

  @Post()
  @UseGuards(TenantAdminGuard)
  async create(@Body() body: { name: string; description?: string; parentId?: string }) {
    try {
      this.requireTenantId();
      return await this.repository.create(body);
    } catch (e) { if (e instanceof HttpException) throw e; throw new HttpException('创建组织失败', 500); }
  }

  @Patch(':id')
  @UseGuards(TenantAdminGuard)
  async update(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    try { return await this.repository.update(id, body); }
    catch (e) { if (e instanceof HttpException) throw e; throw new HttpException('更新组织失败', 500); }
  }

  @Delete(':id')
  @UseGuards(TenantAdminGuard)
  async remove(@Param('id') id: string) {
    try { await this.repository.delete(id); return { success: true }; }
    catch (e) { if (e instanceof HttpException) throw e; throw new HttpException('删除组织失败', 500); }
  }
}
