import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

/**
 * Redis 配置
 */
export class RedisConfig {
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
  password?: string;

  @IsNumber()
  @Min(0)
  @Max(15)
  @IsOptional()
  db?: number;
}
