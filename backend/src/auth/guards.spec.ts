import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { SessionGuard } from './session.guard';
import type { AuthenticatedRequest } from './session.guard';
import { TenantAdminGuard } from './tenant-admin.guard';
import { AUTH_SESSION_COOKIE } from './auth-session.service';

const mockContext = (request: Partial<AuthenticatedRequest>): ExecutionContext =>
  ({ switchToHttp: () => ({ getRequest: () => request }) }) as never;

describe('SessionGuard（全局会话守卫）', () => {
  let guard: SessionGuard;
  let sessionService: { verifySession: jest.Mock };

  beforeEach(() => {
    sessionService = { verifySession: jest.fn() };
    guard = new SessionGuard(sessionService as never);
  });

  it('白名单路径放行（无会话也通过）', () => {
    expect(guard.canActivate(mockContext({ path: '/api/auth/login' }))).toBe(true);
    expect(guard.canActivate(mockContext({ path: '/api/auth/callback' }))).toBe(true);
    expect(guard.canActivate(mockContext({ path: '/api/auth/logout' }))).toBe(true);
  });

  it('无会话访问业务 API → 401（验收 B1-1）', () => {
    expect(() => guard.canActivate(mockContext({ path: '/api/users' }))).toThrow(
      UnauthorizedException,
    );
  });

  it('有效会话：附加 authSession 并放行', () => {
    sessionService.verifySession.mockReturnValue({ sub: 'user-1', rt: 'rt' });
    const request: Partial<AuthenticatedRequest> = {
      path: '/api/users',
      headers: { cookie: `${AUTH_SESSION_COOKIE}=session-jwt` },
    };

    expect(guard.canActivate(mockContext(request))).toBe(true);
    expect(request.authSession).toEqual({ sub: 'user-1', rt: 'rt' });
  });
});

describe('TenantAdminGuard（租户管理员守卫）', () => {
  let guard: TenantAdminGuard;
  let tenantContext: { get: jest.Mock };

  beforeEach(() => {
    tenantContext = { get: jest.fn() };
    guard = new TenantAdminGuard(tenantContext as never);
  });

  it('无租户上下文 → 403', () => {
    tenantContext.get.mockReturnValue(undefined);
    expect(() => guard.canActivate(mockContext({}))).toThrow(ForbiddenException);
  });

  it('当前租户内无 tenant-admin 角色 → 403', () => {
    tenantContext.get.mockReturnValue({
      tenantId: 'org-1',
      organizationRoles: ['member'],
    });
    expect(() => guard.canActivate(mockContext({}))).toThrow(ForbiddenException);
  });

  it('含 tenant-admin 角色 → 放行', () => {
    tenantContext.get.mockReturnValue({
      tenantId: 'org-1',
      organizationRoles: ['member', 'tenant-admin'],
    });
    expect(guard.canActivate(mockContext({}))).toBe(true);
  });
});
