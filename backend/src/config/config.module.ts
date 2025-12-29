import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { EnvironmentVariables } from './dto';

/**
 * 配置模块 - 全局模块
 * 提供应用配置管理
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config) => {
        const validatedConfig = new EnvironmentVariables();
        Object.assign(validatedConfig, config);

        // 在这里可以添加自定义验证逻辑
        // 但主要的验证已经在 EnvironmentVariables 类中通过 class-validator 装饰器完成

        return validatedConfig;
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
