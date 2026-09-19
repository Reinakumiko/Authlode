import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { IAM_PROVIDER } from '../iam/interfaces';
import type { IamProviderInterface } from '../iam/interfaces';
import { TenantContextService } from '../tenant/tenant-context.service';
import { TenantRepository } from '../tenant/tenant.repository';
import { InvitationRepository } from './repositories/invitation.repository';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly tenantContext: TenantContextService,
    private readonly tenantRepository: TenantRepository,
    @Inject(IAM_PROVIDER) private readonly iamProvider: IamProviderInterface,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /** 创建邀请（租户管理员操作） */
  async create(email: string, roleIds?: string[], message?: string) {
    const ctx = this.tenantContext.get();
    if (!ctx?.tenantId) throw new Error('No tenant context');

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const link = `${frontendUrl}/register?token=${token}`;

    const invitation = await this.invitationRepository.create({
      tenantId: ctx.tenantId,
      email,
      token,
      roleIds: roleIds ? JSON.stringify(roleIds) : '[]',
      status: 'PENDING',
      invitedBy: ctx.userId ?? 'unknown',
      message: message ?? null,
      expiresAt,
    });

    this.mailService.sendInvitationEmail(email, link).catch(err =>
      this.logger.warn(`Mail send failed: ${err.message}`),
    );

    return { id: invitation.id, email, status: 'PENDING', expiresAt: expiresAt.toISOString(), link };
  }

  /** 租户作用域邀请列表 */
  async list(page = 1, pageSize = 20) {
    const result = await this.invitationRepository.findPaginated({
      page, pageSize, orderBy: { createdAt: 'desc' },
    });
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return {
      data: result.data.map(inv => ({
        ...inv,
        link: `${frontendUrl}/register?token=${inv.token}`,
      })),
      totalCount: result.total,
    };
  }

  /** 取消邀请 */
  async cancel(id: string) {
    await this.invitationRepository.update(id, { status: 'CANCELLED' });
    return { success: true };
  }

  /** 公开验证（无认证） */
  async verifyToken(token: string) {
    const inv = await this.invitationRepository.findByToken(token);
    if (!inv) throw new Error('邀请不存在');
    if (inv.status === 'CANCELLED') throw new Error('邀请已取消');
    if (inv.status === 'ACCEPTED') throw new Error('邀请已被接受');
    if (new Date(inv.expiresAt) < new Date()) throw new Error('邀请已过期');

    const tenant = await this.tenantRepository.findById(inv.tenantId ?? '');
    return { email: inv.email, organizationName: tenant?.name ?? '', expiresAt: inv.expiresAt };
  }

  /** 公开接受（双语义：新 email 建号 / 已有 email 入租户） */
  async accept(token: string, password: string, name?: string) {
    const inv = await this.invitationRepository.findByToken(token);
    if (!inv) throw new Error('邀请不存在');
    if (inv.status === 'ACCEPTED') return { success: true, mode: 'already-accepted', userId: inv.acceptedBy ?? '' };
    if (inv.status === 'CANCELLED') throw new Error('邀请已取消');
    if (new Date(inv.expiresAt) < new Date()) throw new Error('邀请已过期');

    const existing = await this.iamProvider.getUserByEmail(inv.email);
    let user; let mode: string;
    if (!existing) {
      user = await this.iamProvider.createUser({ primaryEmail: inv.email, password, name: name ?? undefined });
      mode = 'created';
    } else {
      user = existing;
      mode = 'joined';
    }

    const roleIds: string[] = inv.roleIds ? JSON.parse(inv.roleIds) : [];
    await this.iamProvider.addOrganizationUsers(inv.tenantId ?? '', [user.id], roleIds.length > 0 ? roleIds : undefined);

    await this.invitationRepository.update(inv.id, {
      status: 'ACCEPTED', acceptedBy: user.id, acceptedAt: new Date(),
    });

    return { success: true, mode, userId: user.id };
  }
}
