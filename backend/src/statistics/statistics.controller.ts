import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('api/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * 获取总览数据
   * 返回用户总数、组织总数、活跃会话数
   */
  @Get('overview')
  async getOverview() {
    return this.statisticsService.getOverview();
  }

  /**
   * 获取用户增长数据（最近 30 天）
   */
  @Get('growth')
  async getGrowth() {
    return this.statisticsService.getGrowth();
  }

  /**
   * 获取活动分类统计
   */
  @Get('activity')
  async getActivity() {
    return this.statisticsService.getActivity();
  }
}
