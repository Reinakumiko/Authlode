import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LogtoService } from '../logto/logto.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../logto/interfaces';

@Controller('api/organizations')
export class OrganizationsController {
  constructor(private readonly logtoService: LogtoService) {}

  /**
   * 获取组织列表
   */
  @Get()
  async getOrganizations() {
    return this.logtoService.getOrganizations();
  }

  /**
   * 根据 ID 获取组织详情
   */
  @Get(':id')
  async getOrganizationById(@Param('id') id: string) {
    try {
      return await this.logtoService.getOrganizationById(id);
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
  async createOrganization(@Body() data: CreateOrganizationDto) {
    try {
      return await this.logtoService.createOrganization(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        '创建组织失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 更新组织
   */
  @Patch(':id')
  async updateOrganization(
    @Param('id') id: string,
    @Body() data: UpdateOrganizationDto,
  ) {
    try {
      return await this.logtoService.updateOrganization(id, data);
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
      await this.logtoService.deleteOrganization(id);
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
