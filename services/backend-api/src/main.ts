import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global API prefix — all routes are served under /api/v1/...
  app.setGlobalPrefix('api/v1');

  // Enable CORS so the dashboard (React/Vite) and the Chrome extension
  // can call this API from a different origin.
  app.enableCors({
    origin: '*', // Restrict to specific origins in production
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ValidationPipe automatically validates incoming request bodies
  // against the DTO class annotations (class-validator decorators).
  // transform: true converts plain JSON objects into typed DTO instances.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,        // auto-cast query params / body to DTO types
      whitelist: true,        // strip properties not declared in the DTO
      forbidNonWhitelisted: false, // don't throw on extra fields, just strip
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 BugLens Backend API running on http://localhost:${port}/api/v1`);
}

bootstrap();

