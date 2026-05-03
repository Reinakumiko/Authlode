import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { InvitationRepository } from './repositories/invitation.repository';

@Controller('api/invitations')
export class InvitationsController {
  constructor(private readonly invitationRepository: InvitationRepository) {}

  /**
   * 获取邀请列表
   * 支持按状态筛选、分页
   */
  @Get()
  async getInvitations(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    if (status) {
      return this.invitationRepository.findByStatus(status as any, {
        page,
        pageSize,
      });
    }
    return this.invitationRepository.findPaginated({
      page,
      pageSize,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 发送邀请
   */
  @Post()
  async sendInvitation(
    @Body()
    data: {
      email: string;
      organizationId?: string;
      roleIds?: string[];
      invitedBy: string;
      message?: string;
      expiresInDays?: number;
    },
  ) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays ?? 7));

    return this.invitationRepository.create({
      email: data.email,
      token,
      organizationId: data.organizationId,
      roleIds: JSON.stringify(data.roleIds ?? []),
      invitedBy: data.invitedBy,
      message: data.message,
      expiresAt,
    });
  }

  /**
   * 撤销邀请
   */
  @Delete(':id')
  async revokeInvitation(@Param('id') id: string) {
    return this.invitationRepository.updateStatus(id, 'CANCELLED' as any);
  }
}
