import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { configuration } from './config/configuration';

/**
 * Bootstraps the NestJS application runtime.
 * @returns Promise that resolves when the HTTP server starts listening.
 */
async function bootstrap() {
  const appConfig = configuration();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(appConfig.app.port);
}

void bootstrap();
