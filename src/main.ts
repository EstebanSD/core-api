import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = config.get<number>('port') ?? 8080;
  await app.listen(port);

  console.log(`🚀 Server ready at http://localhost:${port}/api`);
}
void bootstrap();
