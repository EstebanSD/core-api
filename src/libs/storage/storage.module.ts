import { Module, DynamicModule } from '@nestjs/common';
import { AppConfigModule, AppConfigService } from 'src/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { CloudinaryService, LocalStorageService, S3Service } from './providers';

@Module({})
export class StorageModule {
  static registerAsync(): DynamicModule {
    return {
      module: StorageModule,
      imports: [AppConfigModule],
      providers: [
        {
          provide: 'IStorageService',
          useFactory: (configService: AppConfigService, logger: CustomLoggerService) => {
            const provider = configService.storageProvider;

            switch (provider) {
              case 's3':
                return new S3Service(logger);
              case 'cloudinary':
                return new CloudinaryService(configService, logger);
              default:
                return new LocalStorageService(configService, logger);
            }
          },
          inject: [AppConfigService, CustomLoggerService],
        },
      ],
      exports: ['IStorageService'],
    };
  }
}
