import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from './domains/portfolio/projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: `${config.get<string>('mongoUri')}${config.get<string>('mongoDatabases.portfolio')}?retryWrites=true&w=majority`,
      }),
    }),

    ProjectsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
