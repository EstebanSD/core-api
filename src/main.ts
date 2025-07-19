import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CustomLoggerService } from './common/logger/custom-logger.service';
import { LoggingInterceptor } from './common/interceptors';

async function gracefulShutdown(
  signal: string,
  app: INestApplication,
  logger: CustomLoggerService,
) {
  logger.log(`${signal} received, shutting down gracefully...`, 'Bootstrap');
  await app.close();
  logger.log('Application closed successfully', 'Bootstrap');
  process.exit(0);
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: new CustomLoggerService(),
    });

    const config = app.get(AppConfigService);
    const logger = app.get(CustomLoggerService);
    const isProd = process.env.NODE_ENV === 'production';

    const corsOptions = isProd
      ? {
          origin: config.allowedOrigins,
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          allowedHeaders: config.allowedHeaders,
          credentials: true,
          optionsSuccessStatus: 200,
        }
      : {
          origin: true,
          credentials: true,
        };
    app.enableCors(corsOptions);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.setGlobalPrefix('api');
    app.enableShutdownHooks();

    const port = config.port;
    await app.listen(port);

    process.on('SIGTERM', () => {
      void gracefulShutdown('SIGTERM', app, logger);
    });

    process.on('SIGINT', () => {
      void gracefulShutdown('SIGINT', app, logger);
    });

    const url = isProd
      ? 'API successfully started in production mode.'
      : `API running at http://localhost:${port}/api`;

    logger.log(url, 'Bootstrap');
  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}
void bootstrap();
