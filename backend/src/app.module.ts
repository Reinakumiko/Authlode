import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IamModule } from './iam/iam.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantContextMiddleware } from './tenant/tenant-context.middleware';
import { AuthModule } from './auth/auth.module';
import { SessionGuard } from './auth/session.guard';
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
import { TenantApplicationsModule } from './tenant-applications/tenant-applications.module';
import { TenantOrganizationsModule } from './tenant-organizations/tenant-organizations.module';
import { PublicModule } from './public/public.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    IamModule,
    TenantModule,
    AuthModule,
    PrismaModule,
    MailModule,
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
    TenantApplicationsModule,
    TenantOrganizationsModule,
    PublicModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TenantContextMiddleware,
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
