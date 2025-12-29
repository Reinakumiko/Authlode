import { IsString, IsNumber, IsOptional, IsEmail, Min, Max, IsBoolean } from 'class-validator';

/**
 * 邮件配置
 */
export class MailConfig {
  @IsString()
  @IsOptional()
  host?: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  port?: number;

  @IsBoolean()
  @IsOptional()
  secure?: boolean;

  @IsEmail()
  @IsOptional()
  user?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEmail()
  @IsOptional()
  from?: string;
}
