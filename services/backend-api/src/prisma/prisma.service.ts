import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService wraps PrismaClient and integrates it with NestJS lifecycle hooks.
 *
 * - OnModuleInit: connects to the database when the NestJS module initializes.
 * - OnModuleDestroy: gracefully disconnects when the application shuts down.
 *
 * This service is provided globally via PrismaModule so any other module
 * can inject it without re-importing PrismaModule.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connected ✓');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
  }
}
