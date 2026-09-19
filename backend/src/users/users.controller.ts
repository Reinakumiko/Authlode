import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, Inject,
  HttpException, HttpStatus, ForbiddenException,
} from '@nestjs/common';
import { IAM_PROVIDER } from '../iam/interfaces';
import type { IamProviderInterface, IamCreateUser, IamUpdateUser } from '../iam/interfaces';
import { TenantContextService } from '../tenant/tenant-context.service';

@Controller('api/users')
export class UsersController {
  constructor(
    @Inject(IAM_PROVIDER) private readonly iamProvider: IamProviderInterface,
    private readonly tenantContext: TenantContextService,
  ) {}

  private requireTenantId(): string {
    const ctx = this.tenantContext.get();
    if (!ctx?.tenantId) throw new ForbiddenException('No tenant context');
    return ctx.tenantId;
  }

  @Get()
  async getUsers(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    try {
      const tenantId = this.requireTenantId();
      const res = await this.iamProvider.getOrganizationUsers(tenantId, { search, page, pageSize });
      return { data: res.data.map(u => ({ id: u.userId, username: u.username, primaryEmail: u.primaryEmail, name: u.name, joinedAt: u.joinedAt })), totalCount: res.totalCount };
    } catch (e) { if (e instanceof HttpException) throw e; throw new HttpException('获取用户列表失败', 500); }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try { return await this.iamProvider.getUserById(id); }
    catch (e) { if (e instanceof HttpException) throw e; throw new HttpException(`获取用户 ${id} 失败`, 500); }
  }

  @Post()
  async createUser(@Body() data: IamCreateUser) {
    try {
      const tenantId = this.requireTenantId();
      const user = await this.iamProvider.createUser(data);
      await this.iamProvider.addOrganizationUsers(tenantId, [user.id]);
      return user;
    } catch (e) { if (e instanceof HttpException) throw e; throw new HttpException('创建用户失败', 500); }
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() data: IamUpdateUser) {
    try { return await this.iamProvider.updateUser(id, data); }
    catch (e) { if (e instanceof HttpException) throw e; throw new HttpException(`更新用户 ${id} 失败`, 500); }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try { await this.iamProvider.deleteUser(id); return { success: true }; }
    catch (e) { if (e instanceof HttpException) throw e; throw new HttpException(`删除用户 ${id} 失败`, 500); }
  }
}
