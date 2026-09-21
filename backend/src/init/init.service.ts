import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryAdapter } from '../iam/memory-adapter/memory.adapter';
import { TenantRepository } from '../tenant/tenant.repository';

/**
 * 首次初始化服务 — 空数据库时自动创建管理员 + 默认租户
 *
 * 触发条件：IamUser 表为空（首次启动）
 * 配置来源：
 *   .env: ADMIN_EMAIL + ADMIN_PASSWORD + ADMIN_NAME（推荐）
 *   未配置: 使用默认值 admin@authlode.local / admin123456
 *
 * 创建内容：
 *   1. tenant-admin 组织角色
 *   2. 默认租户（Default）
 *   3. 管理员用户（加入默认租户 + 授 tenant-admin）
 */
@Injectable()
export class InitService implements OnModuleInit {
  private readonly logger = new Logger(InitService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly memoryAdapter: MemoryAdapter,
    private readonly tenantRepository: TenantRepository,
  ) {}

  async onModuleInit() {
    // 只在 memory 模式下执行
    const provider = this.configService.get<string>('IAM_PROVIDER') ?? 'memory';
    if (provider !== 'memory') {
      this.logger.debug('非 memory 模式，跳过初始化');
      return;
    }

    // 检查是否已初始化
    const userCount = await this.prisma.iamUser.count();
    if (userCount > 0) {
      this.logger.debug(`已有 ${userCount} 个用户，跳过初始化`);
      return;
    }

    this.logger.log('首次启动 — 开始初始化管理员和默认租户');

    try {
      // 1. 创建 tenant-admin 组织角色
      let tenantAdminRole = await this.prisma.iamOrgRole.findUnique({
        where: { name: 'tenant-admin' },
      });
      if (!tenantAdminRole) {
        tenantAdminRole = await this.prisma.iamOrgRole.create({
          data: { name: 'tenant-admin', description: '租户管理员' },
        });
        this.logger.log('✓ 创建组织角色: tenant-admin');
      }

      // 2. 创建默认租户
      let defaultOrg = await this.prisma.iamOrganization.findFirst({
        where: { name: 'Default' },
      });
      if (!defaultOrg) {
        defaultOrg = await this.prisma.iamOrganization.create({
          data: { name: 'Default', description: '默认租户' },
        });
        this.logger.log(`✓ 创建默认租户: ${defaultOrg.name} (${defaultOrg.id})`);
      }
      const orgId = defaultOrg.id;

      // 3. 创建管理员用户
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') ?? 'admin@authlode.local';
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') ?? 'admin123456';
      const adminName = this.configService.get<string>('ADMIN_NAME') ?? 'Admin';

      const adminUser = await this.memoryAdapter.createUser({
        primaryEmail: adminEmail,
        password: adminPassword,
        name: adminName,
        username: 'admin',
      });
      this.logger.log(`✓ 创建管理员: ${adminEmail}`);

      // 4. 加入默认租户 + 授予 tenant-admin 角色
      await this.memoryAdapter.addOrganizationUsers(
        orgId,
        [adminUser.id],
        [tenantAdminRole.id],
      );
      this.logger.log('✓ 管理员已加入默认租户 (tenant-admin)');

      // 5. 创建 Tenant 记录（JIT）
      await this.tenantRepository.findOrCreate(orgId, defaultOrg.name);
      this.logger.log('✓ Tenant 记录已创建');

      this.logger.log('════════════════════════════════════════════');
      this.logger.log(`  初始化完成`);
      this.logger.log(`  管理员: ${adminEmail}`);
      this.logger.log(`  密码: ${adminPassword}`);
      this.logger.log(`  租户: Default (${orgId})`);
      this.logger.log('════════════════════════════════════════════');
    } catch (error) {
      this.logger.error(`初始化失败: ${error.message}`, error.stack);
      // 不抛出 — 允许系统继续启动（可能已有部分数据）
    }
  }
}
