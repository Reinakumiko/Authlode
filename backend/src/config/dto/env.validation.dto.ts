import { IsString, IsNumber, IsOptional, IsEmail, IsUrl, Min, Max, IsIn } from 'class-validator';

/**
 * 环境变量验证 DTO
 * 使用 class-validator 进行环境变量验证
 */
export class EnvironmentVariables {
  // ============================================
  // Logto Management API 配置
  // ============================================
  @IsUrl({
    require_protocol: true,
    allow_underscores: true,
  })
  @IsOptional()
  LOGTO_MANAGEMENT_API_ENDPOINT?: string;

  @IsString()
  @IsOptional()
  LOGTO_MANAGEMENT_API_KEY?: string;

  @IsString()
  @IsOptional()
  LOGTO_APP_ID?: string;

  @IsString()
  @IsOptional()
  LOGTO_APP_SECRET?: string;

  @IsUrl({
    require_protocol: true,
    allow_underscores: true,
  })
  @IsOptional()
  LOGTO_REDIRECT_URI?: string;

  @IsUrl({
    require_protocol: true,
    allow_underscores: true,
  })
  @IsOptional()
  LOGTO_ENDPOINT?: string;

  // ============================================
  // 数据库配置
  // ============================================
  @IsString()
  @IsIn(['mysql', 'postgresql', 'sqlite'])
  @IsOptional()
  DATABASE_TYPE?: 'mysql' | 'postgresql' | 'sqlite';

  @IsString()
  @IsOptional()
  DATABASE_HOST?: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  DATABASE_PORT?: number;

  @IsString()
  @IsOptional()
  DATABASE_USERNAME?: string;

  @IsString()
  @IsOptional()
  DATABASE_PASSWORD?: string;

  @IsString()
  @IsOptional()
  DATABASE_NAME?: string;

  // ============================================
  // Redis 配置 (可选)
  // ============================================
  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsNumber()
  @Min(0)
  @Max(15)
  @IsOptional()
  REDIS_DB?: number;

  // ============================================
  // JWT 配置
  // ============================================
  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN?: string;

  // ============================================
  // 应用配置
  // ============================================
  @IsNumber()
  @Min(1)
  @Max(65535)
  APP_PORT: number;

  @IsString()
  @IsOptional()
  APP_NAME?: string;

  @IsString()
  @IsOptional()
  NODE_ENV?: 'development' | 'production' | 'test';

  // ============================================
  // 邮件配置 (可选)
  // ============================================
  @IsString()
  @IsOptional()
  MAIL_HOST?: string;

  @IsNumber()
  @IsOptional()
  MAIL_PORT?: number;

  @IsString()
  @IsOptional()
  MAIL_SECURE?: string;

  @IsEmail()
  @IsOptional()
  MAIL_USER?: string;

  @IsString()
  @IsOptional()
  MAIL_PASSWORD?: string;

  @IsEmail()
  @IsOptional()
  MAIL_FROM?: string;

  // ============================================
  // 前端 URL (用于 CORS)
  // ============================================
  @IsUrl({
    require_protocol: true,
  })
  @IsOptional()
  FRONTEND_URL?: string;
}
