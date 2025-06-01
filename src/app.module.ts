import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectModule } from './domains/portfolio/projects/project.module';
import { CustomLoggerService } from './common/logger/custom-logger.service';
import { AboutModule } from './domains/portfolio/about/about.module';
import { StorageModule } from './libs/storage/storage.module';
import { CustomLoggerModule } from './common/logger/custom-logger.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new CustomLoggerService('MongoDB');
        const uri = config.get<string>('MONGO_URI');
        if (!uri) {
          logger.error('MONGO_URI is not defined in the environment variables.');
          process.exit(1);
        }
        return {
          uri,
          dbName: config.get<string>('MONGO_DB_PORTFOLIO'),
        };
      },
    }),
    CustomLoggerModule,
    StorageModule.registerAsync(),
    AboutModule,
    ProjectModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
