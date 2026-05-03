import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LogtoService } from '../logto/logto.service';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationQueryParams,
} from '../logto/interfaces';

@Controller('api/applications')
export class ApplicationsController {
  constructor(private readonly logtoService: LogtoService) {}

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
    const params: ApplicationQueryParams = { search, page, pageSize };
    return this.logtoService.getApplications(params);
  }

  /**
   * 根据 ID 获取应用详情
   */
  @Get(':id')
  async getApplicationById(@Param('id') id: string) {
    try {
      return await this.logtoService.getApplicationById(id);
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
  async createApplication(@Body() data: CreateApplicationDto) {
    try {
      return await this.logtoService.createApplication(data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        '创建应用失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 更新应用
   */
  @Patch(':id')
  async updateApplication(
    @Param('id') id: string,
    @Body() data: UpdateApplicationDto,
  ) {
    try {
      return await this.logtoService.updateApplication(id, data);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `更新应用 ${id} 失败`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
