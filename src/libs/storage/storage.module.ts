import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { CloudinaryService, LocalStorageService, S3Service } from './providers';

@Module({})
export class StorageModule {
  static registerAsync(): DynamicModule {
    return {
      module: StorageModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'IStorageService',
          useFactory: (configService: ConfigService, logger: CustomLoggerService) => {
            const provider = configService.get<string>('STORAGE_PROVIDER');

            switch (provider) {
              case 's3':
                return new S3Service();
              case 'cloudinary':
                return new CloudinaryService(configService, logger);
              default:
                return new LocalStorageService();
            }
          },
          inject: [ConfigService, CustomLoggerService],
        },
      ],
      exports: ['IStorageService'],
    };
  }
}
