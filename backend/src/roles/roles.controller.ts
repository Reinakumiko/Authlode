import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { IAM_PROVIDER } from '../iam/interfaces';
import type {
  IamProviderInterface,
  IamCreateRole,
  IamUpdateRole,
} from '../iam/interfaces';

@Controller('api/roles')
export class RolesController {
  constructor(
    @Inject(IAM_PROVIDER) private readonly iamProvider: IamProviderInterface,
  ) {}

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
    try {
      return await this.iamProvider.getRoles({ search, page, pageSize });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('获取角色列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 根据 ID 获取角色详情
   */
  @Get(':id')
  async getRoleById(@Param('id') id: string) {
    try {
      return await this.iamProvider.getRoleById(id);
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
  async createRole(@Body() data: IamCreateRole) {
    try {
      return await this.iamProvider.createRole(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('创建角色失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 更新角色
   */
  @Patch(':id')
  async updateRole(@Param('id') id: string, @Body() data: IamUpdateRole) {
    try {
      return await this.iamProvider.updateRole(id, data);
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
      await this.iamProvider.deleteRole(id);
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
