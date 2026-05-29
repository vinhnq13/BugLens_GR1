import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';

/**
 * IssuesModule bundles the controller and service for all /issues routes.
 *
 * PrismaService is available here automatically because PrismaModule
 * is decorated with @Global() in src/prisma/prisma.module.ts.
 */
@Module({
  controllers: [IssuesController],
  providers: [IssuesService],
})
export class IssuesModule {}
