import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { IssuesModule } from './issues/issues.module';
import { AnalyticsModule } from './analytics/analytics.module';

/**
 * AppModule is the root module of the BugLens Backend API.
 *
 * It imports:
 * - ConfigModule: loads .env variables globally (process.env.*)
 * - PrismaModule: provides PrismaService globally to all feature modules
 * - IssuesModule: handles all /issues REST endpoints
 * - AnalyticsModule: handles all /analytics REST endpoints
 */
@Module({
  imports: [
    // Load .env file globally — no need to import ConfigModule in feature modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Provides PrismaService globally
    PrismaModule,

    // Feature modules
    IssuesModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
