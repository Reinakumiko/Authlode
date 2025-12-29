import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogtoModule } from './logto/logto.module';
import { PrismaModule } from './prisma/prisma.module';
import { InvitationsModule } from './invitations/invitations.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { UserExtendsModule } from './user-extends/user-extends.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [LogtoModule, PrismaModule, InvitationsModule, AuditLogsModule, UserExtendsModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
