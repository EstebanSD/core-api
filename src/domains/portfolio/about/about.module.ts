import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';
import {
  AboutGeneral,
  AboutGeneralSchema,
  AboutTranslation,
  AboutTranslationSchema,
} from './schemas';
import { StorageModule } from 'src/libs/storage';
import { DB_CONNECTIONS } from 'src/common/constants';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: AboutGeneral.name, schema: AboutGeneralSchema },
        { name: AboutTranslation.name, schema: AboutTranslationSchema },
      ],
      DB_CONNECTIONS.PORTFOLIO,
    ),
    StorageModule.registerAsync(),
  ],
  controllers: [AboutController],
  providers: [AboutService, CustomLoggerService],
})
export class AboutModule {}
