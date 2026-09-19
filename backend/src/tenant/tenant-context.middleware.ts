import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { AuthSessionService, AUTH_SESSION_COOKIE } from '../auth/auth-session.service';
import { TenantContextService } from './tenant-context.service';
import { TenantRepository } from './tenant.repository';
import { IAM_PROVIDER } from '../iam/interfaces';
import type { IamProviderInterface } from '../iam/interfaces';

/**
 * TenantContext 中间件（B1.6 核心）
 *
 * 会话 → 用户组织列表（IAM）→ 当前租户（x-tenant-id 或首个组织）→
 * 成员校验（非成员 403）→ JIT Tenant 记录 → ALS 上下文
 * （此后 BaseRepository 的 scopeWhere/scopeCreate 强制隔离生效）
 *
 * - 无会话：静默放行（SessionGuard 负责 401）
 * - 有会话无组织：放行（无租户上下文；/api/auth/me 等仍可用）
 * - IAM 故障：降级放行（不阻塞请求，无租户上下文）
 *
 * 注：每请求一次 getUserOrganizations IAM 调用 — B2 优化点（缓存）。
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);

  constructor(
    private readonly sessionService: AuthSessionService,
    private readonly tenantContextService: TenantContextService,
    private readonly tenantRepository: TenantRepository,
    @Inject(IAM_PROVIDER) private readonly iamProvider: IamProviderInterface,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const session = this.readSession(req);
    if (!session) {
      return next();
    }

    try {
      const userOrganizations = await this.iamProvider.getUserOrganizations(
        session.sub,
      );

      // 当前租户：x-tenant-id 优先（校验成员关系），否则首个组织
      const headerTenant = req.headers['x-tenant-id'];
      const requestedTenantId =
        typeof headerTenant === 'string' && headerTenant.length > 0
          ? headerTenant
          : undefined;

      const current = requestedTenantId
        ? userOrganizations.find((o) => o.organization.id === requestedTenantId)
        : userOrganizations[0];

      if (requestedTenantId && !current) {
        // 验收标准 B1-4：非成员传他人 tenantId → 403
        throw new ForbiddenException('Not a member of the requested tenant');
      }

      if (!current) {
        return next();
      }

      // JIT：Tenant 记录不存在则补（租户管理员首登，实施方案 1.2）
      await this.tenantRepository.findOrCreate(
        current.organization.id,
        current.organization.name,
      );

      return this.tenantContextService.run(
        {
          tenantId: current.organization.id,
          userId: session.sub,
          organizationRoles: current.organizationRoles.map((role) => role.name),
        },
        () => next(),
      );
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(
        `TenantContext resolution failed, degrading to no-tenant context: ${
          (error as Error).message
        }`,
      );
      return next();
    }
  }

  private readSession(req: Request) {
    const header = req.headers?.cookie;
    if (!header) {
      return null;
    }
    for (const part of header.split(';')) {
      const [key, ...rest] = part.trim().split('=');
      if (key === AUTH_SESSION_COOKIE) {
        return this.sessionService.verifySession(
          decodeURIComponent(rest.join('=')),
        );
      }
    }
    return null;
  }
}
