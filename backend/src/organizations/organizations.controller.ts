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
  IamCreateOrganization,
  IamUpdateOrganization,
} from '../iam/interfaces';

@Controller('api/organizations')
export class OrganizationsController {
  constructor(
    @Inject(IAM_PROVIDER) private readonly iamProvider: IamProviderInterface,
  ) {}

  /**
   * 获取组织列表
   * 支持搜索、分页
   */
  @Get()
  async getOrganizations(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    try {
      return await this.iamProvider.getOrganizations({ search, page, pageSize });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('获取组织列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 根据 ID 获取组织详情
   */
  @Get(':id')
  async getOrganizationById(@Param('id') id: string) {
    try {
      return await this.iamProvider.getOrganizationById(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `获取组织 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 创建组织
   */
  @Post()
  async createOrganization(@Body() data: IamCreateOrganization) {
    try {
      return await this.iamProvider.createOrganization(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('创建组织失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 更新组织
   */
  @Patch(':id')
  async updateOrganization(
    @Param('id') id: string,
    @Body() data: IamUpdateOrganization,
  ) {
    try {
      return await this.iamProvider.updateOrganization(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `更新组织 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 删除组织
   */
  @Delete(':id')
  async deleteOrganization(@Param('id') id: string) {
    try {
      await this.iamProvider.deleteOrganization(id);
      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `删除组织 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
