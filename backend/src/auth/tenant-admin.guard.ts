import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { TenantContextService } from '../tenant/tenant-context.service';

/**
 * 租户管理员守卫（B1.6）
 *
 * 消费 TenantContextMiddleware 填充的组织角色：
 * 当前租户内 organizationRoles 含 'tenant-admin' 才放行。
 * 用法：管理操作端点上 @UseGuards(TenantAdminGuard)。
 */
@Injectable()
export class TenantAdminGuard implements CanActivate {
  constructor(private readonly tenantContext: TenantContextService) {}

  canActivate(_context: ExecutionContext): boolean {
    const data = this.tenantContext.get();
    if (!data?.tenantId) {
      throw new ForbiddenException('No tenant context');
    }
    if (!data.organizationRoles?.includes('tenant-admin')) {
      throw new ForbiddenException('Tenant admin role required');
    }
    return true;
  }
}
