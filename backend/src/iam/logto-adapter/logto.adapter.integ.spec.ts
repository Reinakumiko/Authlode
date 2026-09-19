import { readFileSync } from 'fs';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LogtoAdapter } from './logto.adapter';
import { LogtoTokenManager } from './logto-token.manager';
import { IamConfigService } from '../iam.config';

/**
 * LogtoAdapter 集成冒烟 — 需要本地 Logto 运行 + backend/.env 配置
 * （无环境时自动跳过；有环境时验证 F1/F5 修正后的真实链路）
 *
 * 前置：deployment/logto 的 docker compose 已启动，且 poc-v1-v5.sh 已跑过
 * （依赖测试数据：alice@authlode.dev 属于 Acme/Beta 两个组织）
 */
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2];
  }
}
const hasEnv = !!process.env.LOGTO_M2M_APP_ID;
const describeIf = hasEnv ? describe : describe.skip;

describeIf('LogtoAdapter (integration smoke)', () => {
  let adapter: LogtoAdapter;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        { provide: ConfigService, useValue: new ConfigService(process.env) },
        IamConfigService,
        LogtoTokenManager,
        LogtoAdapter,
      ],
    }).compile();
    adapter = module.get(LogtoAdapter);
  });

  it('F1/F5: M2M token 交换（admin 租户）+ 用户列表（default 租户）', async () => {
    const users = await adapter.getUsers({ page: 1, pageSize: 5 });
    expect(users.data.length).toBeGreaterThan(0);
    expect(users.data[0].id).toBeTruthy();
  });

  it('getUserByEmail：精确匹配（邀请先查后建锚点）', async () => {
    const alice = await adapter.getUserByEmail('alice@authlode.dev');
    expect(alice).not.toBeNull();
    expect(alice?.primaryEmail).toBe('alice@authlode.dev');
    expect(await adapter.getUserByEmail('nobody@nowhere.dev')).toBeNull();
  });

  it('getUserOrganizations：多归属 + 各组织角色（TenantContext 数据源）', async () => {
    const alice = await adapter.getUserByEmail('alice@authlode.dev');
    expect(alice).not.toBeNull();
    const orgs = await adapter.getUserOrganizations(alice!.id);
    expect(orgs.length).toBeGreaterThanOrEqual(2);
    const acme = orgs.find((o) => o.organization.name === 'Acme');
    expect(acme).toBeDefined();
    expect(acme!.organizationRoles.map((r) => r.name)).toContain('tenant-admin');
  });

  it('getOrganizationRoles：模板级角色列表', async () => {
    const roles = await adapter.getOrganizationRoles();
    expect(roles.map((r) => r.name)).toContain('tenant-admin');
  });

  it('getOidcEndpoints：端点信息完整', () => {
    const endpoints = adapter.getOidcEndpoints();
    expect(endpoints.issuer).toMatch(/\/oidc$/);
    expect(endpoints.jwksUri).toContain('/jwks');
    expect(endpoints.authorizationUrl).toContain('/auth');
  });
});
