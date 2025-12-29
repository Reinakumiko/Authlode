import { IsString, IsOptional } from 'class-validator';

/**
 * JWT 配置
 */
export class JwtConfig {
  @IsString()
  secret: string;

  @IsString()
  @IsOptional()
  expiresIn?: string;
}
