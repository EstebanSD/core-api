import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from './domains/portfolio/projects/projects.module';
import { CustomLoggerService } from './common/logger/custom-logger.service';
import { AboutModule } from './domains/portfolio/about/about.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
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

    AboutModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class AppModule {}
