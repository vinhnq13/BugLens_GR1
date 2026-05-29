import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

/**
 * AnalyticsController exposes read-only analytics endpoints.
 *
 * Full path after global prefix: GET /api/v1/analytics/overview
 */
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview() {
    const data = await this.analyticsService.getOverview();
    return {
      success: true,
      message: 'Analytics overview retrieved successfully',
      data,
    };
  }
}
