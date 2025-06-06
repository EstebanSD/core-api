import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectModule } from './domains/portfolio/projects/project.module';
import { AboutModule } from './domains/portfolio/about/about.module';
import { StorageModule } from './libs/storage';
import { CustomLoggerModule } from './common/logger/custom-logger.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppConfig, AppConfigModule } from './config';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    CustomLoggerModule,
    AppConfigModule,
    StorageModule.registerAsync(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService], // MongooseModule needs ConfigService to access configuration
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        uri: configService.getOrThrow('mongoUri'),
        dbName: configService.getOrThrow<{ portfolio: string }>('mongoDatabases').portfolio,
      }),
    }),

    AboutModule,
    ProjectModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
