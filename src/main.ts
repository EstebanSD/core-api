import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config';
import { ValidationPipe } from '@nestjs/common';
import { CustomLoggerService } from './common/logger/custom-logger.service';
import { LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLoggerService(),
  });

  const config = app.get(AppConfigService);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.setGlobalPrefix('api');

  const port = config.port;
  await app.listen(port);

  const isProd = process.env.NODE_ENV === 'production';
  const logger = app.get(CustomLoggerService);
  const url = isProd
    ? 'API successfully started in production mode.'
    : `API running at http://localhost:${port}/api`;

  logger.log(url, 'Bootstrap');
}
void bootstrap();
