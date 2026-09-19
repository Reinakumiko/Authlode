import { Global, Module } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';
import { TenantRepository } from './tenant.repository';

/**
 * 租户模块 — 全局
 *
 * 提供：
 * - TenantContextService：请求级租户上下文（B1.6 中间件填充）
 * - TenantRepository：租户注册表（JIT 创建）
 */
@Global()
@Module({
  providers: [TenantContextService, TenantRepository],
  exports: [TenantContextService, TenantRepository],
})
export class TenantModule {}
