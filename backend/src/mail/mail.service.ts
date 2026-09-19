import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  /** 开发环境：仅日志输出；生产环境 SMTP 待接入 */
  async sendInvitationEmail(email: string, link: string): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`[DEV] 邀请邮件 → ${email}: ${link}`);
      return;
    }
    // TODO: 生产环境 SMTP 发送
    this.logger.log(`[PROD] 邀请邮件 → ${email}: ${link}`);
  }
}
