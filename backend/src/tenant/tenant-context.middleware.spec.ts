import { ForbiddenException } from '@nestjs/common';
import { TenantContextMiddleware } from './tenant-context.middleware';
import { TenantContextService } from './tenant-context.service';

describe('TenantContextMiddleware', () => {
  let middleware: TenantContextMiddleware;
  let sessionService: { verifySession: jest.Mock };
  let tenantContextService: { run: jest.Mock };
  let tenantRepository: { findOrCreate: jest.Mock };
  let iamProvider: { getUserOrganizations: jest.Mock };

  const mockReq = (cookies: Record<string, string> = {}, headers: Record<string, string> = {}) => ({
    headers: {
      cookie: Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join('; '),
      ...headers,
    },
  });

  const orgs = [
    {
      organization: { id: 'org-acme', name: 'Acme' },
      organizationRoles: [{ id: 'r1', name: 'tenant-admin' }],
    },
    {
      organization: { id: 'org-beta', name: 'Beta' },
      organizationRoles: [],
    },
  ];

  beforeEach(() => {
    sessionService = { verifySession: jest.fn() };
    tenantContextService = { run: jest.fn() };
    tenantRepository = { findOrCreate: jest.fn() };
    iamProvider = { getUserOrganizations: jest.fn() };
    middleware = new TenantContextMiddleware(
      sessionService as never,
      tenantContextService as never,
      tenantRepository as never,
      iamProvider as never,
    );
  });

  it('无会话：静默放行（SessionGuard 负责 401）', async () => {
    const next = jest.fn();
    await middleware.use(mockReq() as never, {} as never, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(iamProvider.getUserOrganizations).not.toHaveBeenCalled();
  });

  it('有效会话：解析组织 → JIT → ALS 上下文（默认首个组织）', async () => {
    sessionService.verifySession.mockReturnValue({ sub: 'user-1', rt: 'rt' });
    iamProvider.getUserOrganizations.mockResolvedValue(orgs);
    tenantRepository.findOrCreate.mockResolvedValue({});
    const next = jest.fn();
    tenantContextService.run.mockImplementation((_data, fn) => fn());

    await middleware.use(mockReq({ auth_session: 'jwt' }) as never, {} as never, next);

    expect(tenantRepository.findOrCreate).toHaveBeenCalledWith('org-acme', 'Acme');
    expect(tenantContextService.run).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'org-acme',
        userId: 'user-1',
        organizationRoles: ['tenant-admin'],
      }),
      expect.any(Function),
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('x-tenant-id 指定成员组织：上下文切换到该组织', async () => {
    sessionService.verifySession.mockReturnValue({ sub: 'user-1', rt: 'rt' });
    iamProvider.getUserOrganizations.mockResolvedValue(orgs);
    tenantRepository.findOrCreate.mockResolvedValue({});
    tenantContextService.run.mockImplementation((_data, fn) => fn());
    const next = jest.fn();

    await middleware.use(
      mockReq({ auth_session: 'jwt' }, { 'x-tenant-id': 'org-beta' }) as never,
      {} as never,
      next,
    );

    expect(tenantRepository.findOrCreate).toHaveBeenCalledWith('org-beta', 'Beta');
    expect(tenantContextService.run).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'org-beta', organizationRoles: [] }),
      expect.any(Function),
    );
  });

  it('x-tenant-id 非成员组织：403（验收 B1-4）', async () => {
    sessionService.verifySession.mockReturnValue({ sub: 'user-1', rt: 'rt' });
    iamProvider.getUserOrganizations.mockResolvedValue(orgs);
    const next = jest.fn();

    await expect(
      middleware.use(
        mockReq({ auth_session: 'jwt' }, { 'x-tenant-id': 'org-other' }) as never,
        {} as never,
        next,
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(next).not.toHaveBeenCalled();
  });

  it('有会话但无任何组织：放行（无租户上下文）', async () => {
    sessionService.verifySession.mockReturnValue({ sub: 'user-1', rt: 'rt' });
    iamProvider.getUserOrganizations.mockResolvedValue([]);
    const next = jest.fn();

    await middleware.use(mockReq({ auth_session: 'jwt' }) as never, {} as never, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(tenantContextService.run).not.toHaveBeenCalled();
  });

  it('IAM 故障：降级放行（无租户上下文，不阻塞）', async () => {
    sessionService.verifySession.mockReturnValue({ sub: 'user-1', rt: 'rt' });
    iamProvider.getUserOrganizations.mockRejectedValue(new Error('iam down'));
    const next = jest.fn();

    await middleware.use(mockReq({ auth_session: 'jwt' }) as never, {} as never, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(tenantContextService.run).not.toHaveBeenCalled();
  });
});
