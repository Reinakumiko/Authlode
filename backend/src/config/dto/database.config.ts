import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

/**
 * 数据库配置
 */
export class DatabaseConfig {
  @IsString()
  type: 'mysql' | 'postgresql';

  @IsString()
  host: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

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

import { IsBoolean } from 'class-validator';
