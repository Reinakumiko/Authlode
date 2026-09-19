import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';
import { IAM_PROVIDER } from '../iam/interfaces';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    generatePkce: jest.Mock;
    buildAuthorizeUrl: jest.Mock;
    exchangeCode: jest.Mock;
    fetchUserinfo: jest.Mock;
    buildLogoutUrl: jest.Mock;
  };
  let sessionService: {
    signPreAuth: jest.Mock;
    verifyPreAuth: jest.Mock;
    signSession: jest.Mock;
    verifySession: jest.Mock;
  };
  let iamProvider: { getUserById: jest.Mock; getUserOrganizations: jest.Mock };

  const mockRes = () => ({
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
  });

  const mockReq = (cookies: Record<string, string> = {}, query: Record<string, string> = {}) => ({
    headers: {
      cookie: Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join('; '),
    },
    query,
  });

  beforeEach(async () => {
    authService = {
      generatePkce: jest.fn(),
      buildAuthorizeUrl: jest.fn(),
      exchangeCode: jest.fn(),
      fetchUserinfo: jest.fn(),
      buildLogoutUrl: jest.fn(),
    };
    sessionService = {
      signPreAuth: jest.fn(),
      verifyPreAuth: jest.fn(),
      signSession: jest.fn(),
      verifySession: jest.fn(),
    };
    iamProvider = { getUserById: jest.fn(), getUserOrganizations: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AuthSessionService, useValue: sessionService },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({ FRONTEND_URL: 'http://localhost:3000' })[key],
          },
        },
        { provide: IAM_PROVIDER, useValue: iamProvider },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('应设置预授权 cookie 并重定向到授权 URL（PKCE + state）', () => {
      const pkce = { state: 'state-1', verifier: 'verifier-1', challenge: 'challenge-1' };
      authService.generatePkce.mockReturnValue(pkce);
      sessionService.signPreAuth.mockReturnValue('pre-jwt');
      authService.buildAuthorizeUrl.mockReturnValue('http://logto/oidc/auth?x=1');

      const res = mockRes();
      controller.login(res as never);

      expect(sessionService.signPreAuth).toHaveBeenCalledWith({
        state: 'state-1',
        verifier: 'verifier-1',
      });
      expect(res.cookie).toHaveBeenCalledWith('auth_pre', 'pre-jwt', expect.any(Object));
      expect(res.redirect).toHaveBeenCalledWith('http://logto/oidc/auth?x=1');
    });
  });

  describe('callback', () => {
    it('完整流程：校验 state → 换 token → userinfo → 会话 cookie → 302 前端', async () => {
      sessionService.verifyPreAuth.mockReturnValue({
        state: 'state-1',
        verifier: 'verifier-1',
      });
      authService.exchangeCode.mockResolvedValue({
        access_token: 'at',
        refresh_token: 'rt',
        token_type: 'Bearer',
      });
      authService.fetchUserinfo.mockResolvedValue({ sub: 'user-1' });
      sessionService.signSession.mockReturnValue('session-jwt');

      const res = mockRes();
      const req = mockReq({ auth_pre: 'pre-jwt' }, { code: 'code-1', state: 'state-1' });

      await controller.callback(req as never, res as never);

      expect(authService.exchangeCode).toHaveBeenCalledWith('code-1', 'verifier-1');
      expect(sessionService.signSession).toHaveBeenCalledWith({ sub: 'user-1', rt: 'rt' });
      expect(res.clearCookie).toHaveBeenCalledWith('auth_pre');
      expect(res.cookie).toHaveBeenCalledWith('auth_session', 'session-jwt', expect.any(Object));
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000');
    });

    it('state 不匹配应 401', async () => {
      sessionService.verifyPreAuth.mockReturnValue({
        state: 'state-1',
        verifier: 'v',
      });
      const res = mockRes();
      const req = mockReq({ auth_pre: 'pre-jwt' }, { code: 'code-1', state: 'WRONG' });

      await expect(
        controller.callback(req as never, res as never),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('缺 refresh_token 应 401（F2：prompt=consent 配置错误的显式失败）', async () => {
      sessionService.verifyPreAuth.mockReturnValue({
        state: 'state-1',
        verifier: 'v',
      });
      authService.exchangeCode.mockResolvedValue({
        access_token: 'at',
        token_type: 'Bearer',
      });

      const res = mockRes();
      const req = mockReq({ auth_pre: 'pre-jwt' }, { code: 'code-1', state: 'state-1' });

      await expect(
        controller.callback(req as never, res as never),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('无预授权 cookie 应 401', async () => {
      const res = mockRes();
      const req = mockReq({}, { code: 'code-1', state: 'state-1' });

      await expect(
        controller.callback(req as never, res as never),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('无会话应 401', async () => {
      const req = mockReq();
      await expect(controller.me(req as never)).rejects.toThrow(UnauthorizedException);
    });

    it('有效会话返回用户信息 + 所属组织与角色（验收 B1-2）', async () => {
      sessionService.verifySession.mockReturnValue({ sub: 'user-1', rt: 'rt' });
      iamProvider.getUserById.mockResolvedValue({
        id: 'user-1',
        username: 'alice',
        primaryEmail: 'alice@authlode.dev',
        name: 'Alice',
      });
      iamProvider.getUserOrganizations.mockResolvedValue([
        {
          organization: { id: 'org-acme', name: 'Acme' },
          organizationRoles: [{ id: 'role-1', name: 'tenant-admin' }],
        },
        {
          organization: { id: 'org-beta', name: 'Beta' },
          organizationRoles: [],
        },
      ]);

      const req = mockReq({ auth_session: 'session-jwt' });
      const result = await controller.me(req as never);

      expect(result).toEqual({
        id: 'user-1',
        username: 'alice',
        primaryEmail: 'alice@authlode.dev',
        name: 'Alice',
        organizations: [
          { id: 'org-acme', name: 'Acme', roles: ['tenant-admin'] },
          { id: 'org-beta', name: 'Beta', roles: [] },
        ],
      });
    });

    it('IAM 不可用时回退返回基础身份', async () => {
      sessionService.verifySession.mockReturnValue({ sub: 'user-1', rt: 'rt' });
      iamProvider.getUserById.mockRejectedValue(new Error('iam unavailable'));

      const req = mockReq({ auth_session: 'session-jwt' });
      const result = await controller.me(req as never);

      expect(result).toEqual({ id: 'user-1' });
    });
  });

  describe('logout', () => {
    it('应清会话 cookie 并重定向到 Logto end_session', () => {
      authService.buildLogoutUrl.mockReturnValue('http://logto/oidc/session/end');
      const res = mockRes();

      controller.logout(res as never);

      expect(res.clearCookie).toHaveBeenCalledWith('auth_session');
      expect(res.redirect).toHaveBeenCalledWith('http://logto/oidc/session/end');
    });
  });
});
