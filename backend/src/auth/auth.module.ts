import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';
import { AuthController } from './auth.controller';

/**
 * OIDC 认证模块（B1.5）
 *
 * - AuthService：PKCE / 授权 URL（prompt=consent）/ code 交换 / userinfo
 * - AuthSessionService：平台会话 JWT（B1.6 的 SessionGuard 消费，故导出）
 */
@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ??
          'dev-secret-change-in-production',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthSessionService],
  controllers: [AuthController],
  exports: [AuthSessionService],
})
export class AuthModule {}
