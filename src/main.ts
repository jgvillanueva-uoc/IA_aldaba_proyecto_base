import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { configuration } from './config/configuration';

if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile();
}

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

  // Swagger setup
  if (process.env.NODE_ENV !== 'production') {
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('Gestor ICE API')
      .setDescription('API documentation for Gestor ICE')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    console.log('Swagger UI available at /api');
  }

  await app.listen(appConfig.app.port);
}

void bootstrap();
