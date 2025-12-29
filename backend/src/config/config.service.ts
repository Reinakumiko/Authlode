import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import {
  LogtoConfig,
  DatabaseConfig,
  AppConfig,
  JwtConfig,
  RedisConfig,
  MailConfig,
} from './dto';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(private readonly configService: NestConfigService) {
    this.validateConfig();
  }

  // ============================================
  // Logto 配置
  // ============================================

  get logto(): LogtoConfig {
    return {
      apiEndpoint: this.configService.get<string>(
        'LOGTO_MANAGEMENT_API_ENDPOINT',
      )!,
      apiKey: this.configService.get<string>('LOGTO_MANAGEMENT_API_KEY')!,
      appId: this.configService.get<string>('LOGTO_APP_ID'),
      appSecret: this.configService.get<string>('LOGTO_APP_SECRET'),
      redirectUri: this.configService.get<string>('LOGTO_REDIRECT_URI'),
      endpoint: this.configService.get<string>('LOGTO_ENDPOINT'),
    };
  }

  // ============================================
  // 数据库配置
  // ============================================

  get database(): DatabaseConfig {
    const type = this.configService.get<string>('DATABASE_TYPE')!;
    const host = this.configService.get<string>('DATABASE_HOST')!;
    const port = this.configService.get<number>('DATABASE_PORT')!;
    const username = this.configService.get<string>('DATABASE_USERNAME')!;
    const password = this.configService.get<string>('DATABASE_PASSWORD')!;
    const name = this.configService.get<string>('DATABASE_NAME')!;

    // 如果环境变量中有 DATABASE_URL,直接使用
    const url = this.configService.get<string>('DATABASE_URL');

    return {
      type: type as 'mysql' | 'postgresql',
      host,
      port,
      username,
      password,
      name,
      schema: this.configService.get<string>('DATABASE_SCHEMA'),
      ssl: this.configService.get<boolean>('DATABASE_SSL', false),
      url,
    };
  }

  /**
   * 获取数据库连接 URL
   * 如果环境变量中有 DATABASE_URL,直接使用
   * 否则根据配置生成
   */
  get databaseUrl(): string {
    const url = this.configService.get<string>('DATABASE_URL');
    if (url) {
      return url;
    }

    const db = this.database;
    const ssl = db.ssl ? '?sslmode=require' : '';

    if (db.type === 'postgresql') {
      return `postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}${ssl}`;
    } else if (db.type === 'mysql') {
      return `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}${ssl}`;
    }

    throw new Error(`Unsupported database type: ${db.type}`);
  }

  // ============================================
  // 应用配置
  // ============================================

  get app(): AppConfig {
    return {
      name: this.configService.get<string>('APP_NAME', 'Logto User Center'),
      port: this.configService.get<number>('APP_PORT', 3001),
      nodeEnv: this.configService.get<
        'development' | 'production' | 'test'
      >('NODE_ENV', 'development'),
      frontendUrl: this.configService.get<string>('FRONTEND_URL'),
    };
  }

  // ============================================
  // JWT 配置
  // ============================================

  get jwt(): JwtConfig {
    return {
      secret: this.configService.get<string>('JWT_SECRET')!,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
    };
  }

  // ============================================
  // Redis 配置
  // ============================================

  get redis(): RedisConfig | null {
    const host = this.configService.get<string>('REDIS_HOST');
    if (!host) {
      return null;
    }

    return {
      host,
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
    };
  }

  get isRedisEnabled(): boolean {
    return this.redis !== null;
  }

  // ============================================
  // 邮件配置
  // ============================================

  get mail(): MailConfig | null {
    const host = this.configService.get<string>('MAIL_HOST');
    if (!host) {
      return null;
    }

    return {
      host,
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: this.configService.get<boolean>('MAIL_SECURE', false),
      user: this.configService.get<string>('MAIL_USER'),
      password: this.configService.get<string>('MAIL_PASSWORD'),
      from: this.configService.get<string>('MAIL_FROM'),
    };
  }

  get isMailEnabled(): boolean {
    return this.mail !== null;
  }

  // ============================================
  // 辅助方法
  // ============================================

  /**
   * 验证必需的配置项
   */
  private validateConfig(): void {
    const requiredConfigs = [
      'LOGTO_MANAGEMENT_API_ENDPOINT',
      'LOGTO_MANAGEMENT_API_KEY',
      'DATABASE_TYPE',
      'DATABASE_HOST',
      'DATABASE_PORT',
      'DATABASE_USERNAME',
      'DATABASE_PASSWORD',
      'DATABASE_NAME',
      'JWT_SECRET',
      'APP_PORT',
    ];

    const missingConfigs: string[] = [];

    for (const configKey of requiredConfigs) {
      const value = this.configService.get<string>(configKey);
      if (!value) {
        missingConfigs.push(configKey);
      }
    }

    if (missingConfigs.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingConfigs.join(', ')}`,
      );
    }

    this.logger.log('Configuration validated successfully');
  }

  /**
   * 检查是否为生产环境
   */
  get isProduction(): boolean {
    return this.app.nodeEnv === 'production';
  }

  /**
   * 检查是否为开发环境
   */
  get isDevelopment(): boolean {
    return this.app.nodeEnv === 'development';
  }

  /**
   * 检查是否为测试环境
   */
  get isTest(): boolean {
    return this.app.nodeEnv === 'test';
  }
}
