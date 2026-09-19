import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IamModule } from './iam/iam.module';
import { LogtoModule } from './logto/logto.module';
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
    LogtoModule, // 旧 LogtoService（B1.3 切换完成后移除）
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
