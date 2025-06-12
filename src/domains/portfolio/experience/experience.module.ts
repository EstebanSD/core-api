import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ExperienceGeneral,
  ExperienceGeneralSchema,
  ExperienceTranslation,
  ExperienceTranslationSchema,
} from './schemas';
import { DB_CONNECTIONS } from 'src/common/constants';
import { StorageModule } from 'src/libs/storage';
import { SanitizerModule } from 'src/libs/sanitizer';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './experience.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: ExperienceGeneral.name, schema: ExperienceGeneralSchema },
        { name: ExperienceTranslation.name, schema: ExperienceTranslationSchema },
      ],
      DB_CONNECTIONS.PORTFOLIO,
    ),
    StorageModule.registerAsync(),
    SanitizerModule,
  ],
  controllers: [ExperienceController],
  providers: [ExperienceService],
})
export class ExperienceModule {}
