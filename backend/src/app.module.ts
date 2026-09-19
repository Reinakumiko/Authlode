import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IamModule } from './iam/iam.module';
import { TenantModule } from './tenant/tenant.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { InvitationsModule } from './invitations/invitations.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { UserExtendsModule } from './user-extends/user-extends.module';
import { ConfigModule } from './config/config.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { RolesModule } from './roles/roles.module';
import { ApplicationsModule } from './applications/applications.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    IamModule, // IAM Provider 抽象层（B1.2）— 业务模块注入 IAM_PROVIDER
    TenantModule, // 租户上下文 + 租户注册表（B1.4）— 全局
    AuthModule, // OIDC 认证（B1.5）— login/callback/me/logout
    PrismaModule,
    InvitationsModule,
    AuditLogsModule,
    UserExtendsModule,
    ConfigModule,
    StatisticsModule,
    UsersModule,
    OrganizationsModule,
    RolesModule,
    ApplicationsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
