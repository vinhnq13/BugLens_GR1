import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

/**
 * AppModule is the root module of the BugLens Backend API.
 *
 * It imports:
 * - ConfigModule: loads .env variables globally (process.env.*)
 * - PrismaModule: provides PrismaService globally to all feature modules
 *
 * Feature modules (IssueModule, ProjectModule, etc.) will be added
 * in later phases and imported here.
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
