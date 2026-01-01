import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from '../../common/repositories/base.repository';
import {
  UserInvitation,
  PrismaTypes,
} from '../../prisma-types';

export type CreateInvitationInput = PrismaTypes.UserInvitationCreateInput;
export type UpdateInvitationInput = PrismaTypes.UserInvitationUpdateInput;

// Invitation status values (from schema)
export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type InvitationStatusType = typeof InvitationStatus[keyof typeof InvitationStatus];

@Injectable()
export class InvitationRepository extends BaseRepository<
  UserInvitation,
  CreateInvitationInput,
  UpdateInvitationInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'userInvitation');
  }

  /**
   * 根据 token 查找邀请
   */
  async findByToken(token: string): Promise<UserInvitation | null> {
    try {
      const result = await this.prisma.userInvitation.findUnique({
        where: { token },
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to find invitation by token: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 根据邮箱查找邀请
   */
  async findByEmail(email: string): Promise<UserInvitation[]> {
    try {
      const result = await this.prisma.userInvitation.findMany({
        where: { email },
        orderBy: { createdAt: 'desc' },
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to find invitations by email: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 根据状态查找邀请
   */
  async findByStatus(
    status: InvitationStatusType,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ): Promise<{ data: UserInvitation[]; total: number }> {
    return this.findPaginated({
      ...params,
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 查找待处理的邀请
   */
  async findPendingInvitations(): Promise<UserInvitation[]> {
    try {
      const result = await this.prisma.userInvitation.findMany({
        where: {
          status: InvitationStatus.PENDING,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to find pending invitations: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 查找过期的邀请
   */
  async findExpiredInvitations(): Promise<UserInvitation[]> {
    try {
      const result = await this.prisma.userInvitation.findMany({
        where: {
          status: InvitationStatus.PENDING,
          expiresAt: { lte: new Date() },
        },
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to find expired invitations: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 更新邀请状态
   */
  async updateStatus(
    id: string,
    status: InvitationStatusType,
  ): Promise<UserInvitation> {
    try {
      const result = await this.prisma.userInvitation.update({
        where: { id },
        data: {
          status,
          ...(status === InvitationStatus.ACCEPTED && {
            acceptedAt: new Date(),
          }),
        },
      });
      this.logger.log(`Updated invitation status to ${status}: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update invitation status: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 标记过期邀请
   */
  async markExpiredInvitations(): Promise<{ count: number }> {
    try {
      const result = await this.prisma.userInvitation.updateMany({
        where: {
          status: InvitationStatus.PENDING,
          expiresAt: { lte: new Date() },
        },
        data: {
          status: InvitationStatus.EXPIRED,
        },
      });
      this.logger.log(`Marked ${result.count} invitations as expired`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to mark expired invitations: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 统计邀请数据
   */
  async getInvitationStats(): Promise<{
    total: number;
    pending: number;
    accepted: number;
    expired: number;
    cancelled: number;
  }> {
    try {
      const [total, pending, accepted, expired, cancelled] =
        await Promise.all([
          this.prisma.userInvitation.count(),
          this.prisma.userInvitation.count({
            where: { status: InvitationStatus.PENDING },
          }),
          this.prisma.userInvitation.count({
            where: { status: InvitationStatus.ACCEPTED },
          }),
          this.prisma.userInvitation.count({
            where: { status: InvitationStatus.EXPIRED },
          }),
          this.prisma.userInvitation.count({
            where: { status: InvitationStatus.CANCELLED },
          }),
        ]);

      return { total, pending, accepted, expired, cancelled };
    } catch (error) {
      this.logger.error(
        `Failed to get invitation stats: ${error.message}`,
      );
      throw error;
    }
  }
}
