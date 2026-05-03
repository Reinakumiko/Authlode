import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { LogtoService } from './logto.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
  CreateOrganizationDto,
  CreateRoleDto,
  RoleQueryParams,
  CreateApplicationDto,
  ApplicationQueryParams,
} from './interfaces';

@Controller('api')
export class LogtoController {
  constructor(private readonly logtoService: LogtoService) {}

  // ============================================
  // 用户管理
  // ============================================

  /**
   * 获取用户列表
   * 支持搜索、分页
   */
  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const params: UserQueryParams = { search, page, pageSize };
    return this.logtoService.getUsers(params);
  }

  /**
   * 根据 ID 获取用户详情
   */
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.logtoService.getUserById(id);
  }

  /**
   * 创建用户
   */
  @Post('users')
  async createUser(@Body() data: CreateUserDto) {
    return this.logtoService.createUser(data);
  }

  /**
   * 更新用户
   */
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.logtoService.updateUser(id, data);
  }

  /**
   * 删除用户
   */
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.logtoService.deleteUser(id);
  }

  // ============================================
  // 组织管理
  // ============================================

  /**
   * 获取组织列表
   */
  @Get('organizations')
  async getOrganizations() {
    return this.logtoService.getOrganizations();
  }

  /**
   * 创建组织
   */
  @Post('organizations')
  async createOrganization(@Body() data: CreateOrganizationDto) {
    return this.logtoService.createOrganization(data);
  }

  // ============================================
  // 角色管理
  // ============================================

  /**
   * 获取角色列表
   */
  @Get('roles')
  async getRoles(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const params: RoleQueryParams = { search, page, pageSize };
    return this.logtoService.getRoles(params);
  }

  /**
   * 创建角色
   */
  @Post('roles')
  async createRole(@Body() data: CreateRoleDto) {
    return this.logtoService.createRole(data);
  }

  // ============================================
  // 应用管理
  // ============================================

  /**
   * 获取应用列表
   */
  @Get('applications')
  async getApplications(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const params: ApplicationQueryParams = { search, page, pageSize };
    return this.logtoService.getApplications(params);
  }

  /**
   * 创建应用
   */
  @Post('applications')
  async createApplication(@Body() data: CreateApplicationDto) {
    return this.logtoService.createApplication(data);
  }
}
