import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextData {
  /** 当前租户（= IAM Organization ID） */
  tenantId: string;
  /** 当前用户（IAM User ID，认证后可用） */
  userId?: string;
  /** 用户在当前租户的组织角色名（TenantAdminGuard 消费，B1.6 中间件填充） */
  organizationRoles?: string[];
}

/**
 * 租户上下文 — AsyncLocalStorage 实现（请求级隔离，并发安全）
 *
 * 职责分工：
 * - B1.4（本文件）：存储基础设施 + BaseRepository 消费（查询强制过滤/创建注入）
 * - B1.6：TenantContext 中间件填充（认证 → 组织列表 → 当前租户 → JIT Tenant 记录）
 */
@Injectable()
export class TenantContextService {
  private readonly als = new AsyncLocalStorage<TenantContextData>();

  /** 在指定租户上下文中执行（中间件调用；回调可为同步或异步） */
  run<T>(data: TenantContextData, fn: () => T): T {
    return this.als.run(data, fn);
  }

  /** 当前租户上下文（无则 undefined — 未登录/公开接口） */
  get(): TenantContextData | undefined {
    return this.als.getStore();
  }

  get tenantId(): string | undefined {
    return this.als.getStore()?.tenantId;
  }

  get userId(): string | undefined {
    return this.als.getStore()?.userId;
  }
}
