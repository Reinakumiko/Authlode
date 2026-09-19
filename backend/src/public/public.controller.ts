import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InvitationsService } from '../invitations/invitations.service';

/** 公开端点（无需认证）— 邀请注册流程 */
@Controller('api/public')
export class PublicController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('invitations/verify')
  async verify(@Body() body: { token: string }) {
    try { return await this.invitationsService.verifyToken(body.token); }
    catch (e) { throw new HttpException(e.message ?? '验证失败', HttpStatus.BAD_REQUEST); }
  }

  @Post('invitations/accept')
  async accept(@Body() body: { token: string; password: string; name?: string }) {
    if (!body.password || body.password.length < 8) {
      throw new HttpException('密码至少 8 位', HttpStatus.BAD_REQUEST);
    }
    try { return await this.invitationsService.accept(body.token, body.password, body.name); }
    catch (e) { throw new HttpException(e.message ?? '接受邀请失败', HttpStatus.BAD_REQUEST); }
  }
}
