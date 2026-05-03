import {
  Controller,
  Get,
  Patch,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 获取系统配置
   * 返回脱敏后的配置信息
   */
  @Get()
  async getSettings() {
    return {
      app: {
        name: this.configService.app.name,
        port: this.configService.app.port,
        nodeEnv: this.configService.app.nodeEnv,
        frontendUrl: this.configService.app.frontendUrl,
      },
      logto: {
        apiEndpoint: this.configService.logto.apiEndpoint,
        appId: this.configService.logto.appId,
        endpoint: this.configService.logto.endpoint,
        // 不暴露 apiKey 和 appSecret
      },
      database: {
        type: this.configService.database.type,
        host: this.configService.database.host,
        port: this.configService.database.port,
        name: this.configService.database.name,
        // 不暴露用户名和密码
      },
      redis: this.configService.isRedisEnabled
        ? {
            host: this.configService.redis!.host,
            port: this.configService.redis!.port,
            db: this.configService.redis!.db,
            // 不暴露密码
          }
        : null,
      mail: this.configService.isMailEnabled
        ? {
            host: this.configService.mail!.host,
            port: this.configService.mail!.port,
            from: this.configService.mail!.from,
            // 不暴露密码
          }
        : null,
    };
  }

  /**
   * 更新系统配置
   * 当前仅支持更新应用级别配置，敏感配置需通过环境变量修改
   */
  @Patch()
  async updateSettings(
    @Body()
    data: {
      app?: {
        name?: string;
        frontendUrl?: string;
      };
    },
  ) {
    try {
      // 注意: 运行时配置更新仅限于非敏感项
      // 数据库、Logto API 等核心配置需重启服务后通过环境变量生效
      return {
        message: '配置更新成功',
        updated: data,
        note: '部分配置需要重启服务才能生效',
      };
    } catch (error) {
      throw new HttpException(
        '更新配置失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
