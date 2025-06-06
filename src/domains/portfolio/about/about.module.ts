import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';
import {
  AboutGeneral,
  AboutGeneralSchema,
  AboutTranslation,
  AboutTranslationSchema,
} from '../schemas/about.schema';
import { StorageModule } from 'src/libs/storage';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AboutGeneral.name, schema: AboutGeneralSchema },
      { name: AboutTranslation.name, schema: AboutTranslationSchema },
    ]),
    StorageModule.registerAsync(),
  ],
  controllers: [AboutController],
  providers: [AboutService],
})
export class AboutModule {}
