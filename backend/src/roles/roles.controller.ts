import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LogtoService } from '../logto/logto.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  RoleQueryParams,
} from '../logto/interfaces';

@Controller('api/roles')
export class RolesController {
  constructor(private readonly logtoService: LogtoService) {}

  /**
   * 获取角色列表
   * 支持搜索、分页
   */
  @Get()
  async getRoles(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const params: RoleQueryParams = { search, page, pageSize };
    return this.logtoService.getRoles(params);
  }

  /**
   * 根据 ID 获取角色详情
   */
  @Get(':id')
  async getRoleById(@Param('id') id: string) {
    try {
      return await this.logtoService.getRoleById(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `获取角色 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 创建角色
   */
  @Post()
  async createRole(@Body() data: CreateRoleDto) {
    try {
      return await this.logtoService.createRole(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        '创建角色失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 更新角色
   */
  @Patch(':id')
  async updateRole(@Param('id') id: string, @Body() data: UpdateRoleDto) {
    try {
      return await this.logtoService.updateRole(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `更新角色 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 删除角色
   */
  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    try {
      await this.logtoService.deleteRole(id);
      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `删除角色 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
