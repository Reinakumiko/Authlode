import { IsString, IsNumber, IsOptional, Min, Max, IsUrl } from 'class-validator';

/**
 * 应用配置
 */
export class AppConfig {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number;

  @IsString()
  @IsOptional()
  nodeEnv?: 'development' | 'production' | 'test';

  @IsUrl({
    require_protocol: true,
  })
  @IsOptional()
  frontendUrl?: string;
}
