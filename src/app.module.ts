import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CustomLoggerModule } from './common/logger/custom-logger.module';
import { AppConfig, AppConfigModule } from './config';
import { DB_CONNECTIONS } from './common/constants';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './domains/portfolio/projects/project.module';
import { AboutModule } from './domains/portfolio/about/about.module';
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
        dbName: configService.getOrThrow<{ auth: string }>('mongoDatabases').auth,
      }),
      connectionName: DB_CONNECTIONS.AUTH,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        uri: configService.getOrThrow('mongoUri'),
        dbName: configService.getOrThrow<{ portfolio: string }>('mongoDatabases').portfolio,
      }),
      connectionName: DB_CONNECTIONS.PORTFOLIO,
    }),

    AuthModule,
    AboutModule,
    ProjectModule,
    SkillModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
