import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global API prefix — all routes will be available at /api/...
  app.setGlobalPrefix('api');

  // Allow cross-origin requests from the dashboard frontend
  app.enableCors({
    origin: ['http://localhost:5173'], // Vite dev server
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 BugLens Backend API running on http://localhost:${port}/api`);
}

bootstrap();
