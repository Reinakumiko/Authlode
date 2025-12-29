import { IsString, IsOptional } from 'class-validator';

/**
 * Logto 配置
 */
export class LogtoConfig {
  @IsString()
  apiEndpoint: string;

  @IsString()
  apiKey: string;

  @IsString()
  @IsOptional()
  appId?: string;

  @IsString()
  @IsOptional()
  appSecret?: string;

  @IsString()
  @IsOptional()
  redirectUri?: string;

  @IsString()
  @IsOptional()
  endpoint?: string;
}
