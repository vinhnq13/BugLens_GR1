import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule is decorated with @Global() so that PrismaService
 * is available throughout the entire application without needing
 * to import PrismaModule in every feature module.
 *
 * Simply inject PrismaService in any service where database access is needed.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
