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
  IamCreateUser,
  IamUpdateUser,
  IamUserQuery,
} from '../iam/interfaces';

@Controller('api/users')
export class UsersController {
  constructor(
    @Inject(IAM_PROVIDER) private readonly iamProvider: IamProviderInterface,
  ) {}

  /**
   * 获取用户列表
   * 支持搜索、分页、筛选
   */
  @Get()
  async getUsers(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('emailVerified') emailVerified?: string,
    @Query('isSuspended') isSuspended?: string,
  ) {
    try {
      const query: IamUserQuery = {
        search,
        page,
        pageSize,
        emailVerified:
          emailVerified === 'true' ? true : emailVerified === 'false' ? false : undefined,
        isSuspended:
          isSuspended === 'true' ? true : isSuspended === 'false' ? false : undefined,
      };
      return await this.iamProvider.getUsers(query);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('获取用户列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 根据 ID 获取用户详情
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try {
      return await this.iamProvider.getUserById(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `获取用户 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 创建用户
   */
  @Post()
  async createUser(@Body() data: IamCreateUser) {
    try {
      return await this.iamProvider.createUser(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('创建用户失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 更新用户
   */
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() data: IamUpdateUser) {
    try {
      return await this.iamProvider.updateUser(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `更新用户 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 删除用户
   */
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.iamProvider.deleteUser(id);
      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `删除用户 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
