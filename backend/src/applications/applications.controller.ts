import {
  Controller,
  Get,
  Post,
  Patch,
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
  IamCreateApplication,
  IamUpdateApplication,
} from '../iam/interfaces';

@Controller('api/applications')
export class ApplicationsController {
  constructor(
    @Inject(IAM_PROVIDER) private readonly iamProvider: IamProviderInterface,
  ) {}

  /**
   * 获取应用列表
   * 支持搜索、分页
   */
  @Get()
  async getApplications(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    try {
      return await this.iamProvider.getApplications({ search, page, pageSize });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('获取应用列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 根据 ID 获取应用详情
   */
  @Get(':id')
  async getApplicationById(@Param('id') id: string) {
    try {
      return await this.iamProvider.getApplicationById(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `获取应用 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 创建应用
   */
  @Post()
  async createApplication(@Body() data: IamCreateApplication) {
    try {
      return await this.iamProvider.createApplication(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('创建应用失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 更新应用
   */
  @Patch(':id')
  async updateApplication(
    @Param('id') id: string,
    @Body() data: IamUpdateApplication,
  ) {
    try {
      return await this.iamProvider.updateApplication(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `更新应用 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
