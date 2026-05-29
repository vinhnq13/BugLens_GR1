import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { AiService } from './ai.service';

/**
 * IssuesModule bundles the controller and services for all /issues routes.
 *
 * PrismaService is available here automatically because PrismaModule
 * is decorated with @Global() in src/prisma/prisma.module.ts.
 *
 * AiService is registered here as a provider so it can be injected
 * into IssuesService for the /issues/:id/analyze endpoint.
 */
@Module({
  controllers: [IssuesController],
  providers: [IssuesService, AiService],
})
export class IssuesModule {}

