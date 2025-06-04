import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import {
  ProjectGeneral,
  ProjectGeneralSchema,
  ProjectTranslation,
  ProjectTranslationSchema,
} from '../schemas/project.schema';
import { StorageModule } from 'src/libs/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectGeneral.name, schema: ProjectGeneralSchema },
      { name: ProjectTranslation.name, schema: ProjectTranslationSchema },
    ]),
    StorageModule.registerAsync(),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
