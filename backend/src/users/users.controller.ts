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
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
} from '../logto/interfaces';

@Controller('api/users')
export class UsersController {
  constructor(private readonly logtoService: LogtoService) {}

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
    @Query('phoneVerified') phoneVerified?: string,
    @Query('isSuspended') isSuspended?: string,
  ) {
    const params: UserQueryParams = {
      search,
      page,
      pageSize,
      emailVerified: emailVerified === 'true' ? true : emailVerified === 'false' ? false : undefined,
      phoneVerified: phoneVerified === 'true' ? true : phoneVerified === 'false' ? false : undefined,
      isSuspended: isSuspended === 'true' ? true : isSuspended === 'false' ? false : undefined,
    };
    return this.logtoService.getUsers(params);
  }

  /**
   * 根据 ID 获取用户详情
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try {
      return await this.logtoService.getUserById(id);
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
  async createUser(@Body() data: CreateUserDto) {
    try {
      return await this.logtoService.createUser(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        '创建用户失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 更新用户
   */
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
    try {
      return await this.logtoService.updateUser(id, data);
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
      await this.logtoService.deleteUser(id);
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
