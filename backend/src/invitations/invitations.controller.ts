import {
  Controller, Get, Post, Patch, Param, Query, Body, UseGuards,
  HttpException, HttpStatus,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { TenantAdminGuard } from '../auth/tenant-admin.guard';

@Controller('api/invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  async list(@Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    try { return await this.invitationsService.list(page ?? 1, pageSize ?? 20); }
    catch (e) { throw new HttpException(e.message ?? '获取邀请列表失败', 500); }
  }

  @Post()
  @UseGuards(TenantAdminGuard)
  async create(@Body() body: { email: string; roleIds?: string[]; message?: string }) {
    try { return await this.invitationsService.create(body.email, body.roleIds, body.message); }
    catch (e) { if (e instanceof HttpException) throw e; throw new HttpException(e.message ?? '创建邀请失败', 500); }
  }

  @Patch(':id/cancel')
  @UseGuards(TenantAdminGuard)
  async cancel(@Param('id') id: string) {
    try { return await this.invitationsService.cancel(id); }
    catch (e) { throw new HttpException(e.message ?? '取消邀请失败', 500); }
  }
}
