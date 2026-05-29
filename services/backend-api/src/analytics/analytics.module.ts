import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

/**
 * AnalyticsModule bundles the controller and service for /analytics routes.
 *
 * PrismaService is injected automatically via the global PrismaModule.
 */
@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
