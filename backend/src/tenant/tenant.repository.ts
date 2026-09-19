import { Injectable } from '@nestjs/common';
import { Prisma, Tenant } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from '../common/repositories/base.repository';

/**
 * Tenant 仓库 — 租户注册表
 *
 * 注意：Tenant 表本身不按租户过滤（它是隔离体系的根），
 * 因此不注入 TenantContextService。
 */
@Injectable()
export class TenantRepository extends BaseRepository<
  Tenant,
  Prisma.TenantCreateInput,
  Prisma.TenantUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'tenant');
  }

  /**
   * JIT 创建：租户不存在则补记录
   * （租户管理员首次登录时由 TenantContext 中间件调用，见实施方案 1.2/1.6）
   */
  async findOrCreate(id: string, name: string): Promise<Tenant> {
    const existing = await this.findById(id);
    if (existing) {
      return existing;
    }
    return this.create({ id, name });
  }

  /** 仅返回 ACTIVE 状态的租户（SUSPENDED 视为不可用） */
  async findActiveById(id: string): Promise<Tenant | null> {
    const tenant = await this.findById(id);
    return tenant?.status === 'ACTIVE' ? tenant : null;
  }
}
