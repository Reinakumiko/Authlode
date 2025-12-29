import { IsString, IsNumber, IsOptional, Min, Max, IsBoolean, IsIn } from 'class-validator';

/**
 * 数据库配置
 */
export class DatabaseConfig {
  @IsString()
  @IsIn(['mysql', 'postgresql', 'sqlite'])
  type: 'mysql' | 'postgresql' | 'sqlite';

  @IsString()
  @IsOptional()
  host?: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  schema?: string;

  @IsBoolean()
  @IsOptional()
  ssl?: boolean;

  @IsString()
  @IsOptional()
  url?: string;
}

