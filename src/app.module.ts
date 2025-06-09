import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectModule } from './domains/portfolio/projects/project.module';
import { AboutModule } from './domains/portfolio/about/about.module';
import { CustomLoggerModule } from './common/logger/custom-logger.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppConfig, AppConfigModule } from './config';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { SkillModule } from './domains/portfolio/skills/skill.module';

@Module({
  imports: [
    CustomLoggerModule,
    AppConfigModule,
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
    SkillModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
