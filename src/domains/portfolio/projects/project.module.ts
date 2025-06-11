import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import {
  ProjectGeneral,
  ProjectGeneralSchema,
  ProjectTranslation,
  ProjectTranslationSchema,
} from './schemas';
import { StorageModule } from 'src/libs/storage';
import { DB_CONNECTIONS } from 'src/common/constants';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: ProjectGeneral.name, schema: ProjectGeneralSchema },
        { name: ProjectTranslation.name, schema: ProjectTranslationSchema },
      ],
      DB_CONNECTIONS.PORTFOLIO,
    ),
    StorageModule.registerAsync(),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
