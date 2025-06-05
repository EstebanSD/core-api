import { Readable } from 'stream';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppConfigService } from 'src/config';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { IStorageService, UploadedFile, UploadFileParams } from '../interfaces';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

type CloudinaryDestroyResponse = {
  result: 'ok' | 'not found' | 'error';
};

@Injectable()
export class CloudinaryService implements IStorageService {
  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: CustomLoggerService,
  ) {
    const cloudinaryConfig = this.configService.cloudinaryConfig;
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
    });
  }

  async uploadFile(params: UploadFileParams): Promise<UploadedFile> {
    const { fileBuffer, filename, mimetype, folder, resourceType = 'auto' } = params;
    try {
      const nameWithoutExt = path.parse(filename).name;
      const uniqueName = `${nameWithoutExt}-${uuid()}`;
      const uploadOptions: UploadApiOptions = {
        resource_type: resourceType,
        public_id: uniqueName,
        folder,
        format: mimetype.split('/')[1],
      };

      const uploadStream = (): Promise<UploadedFile> => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error || !result) {
              return reject(
                new InternalServerErrorException('Cloudinary upload failed: ' + error?.message),
              );
            }

            const resource_type = resourceType === 'auto' ? undefined : resourceType;
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              resourceType: resource_type,
              size: result.bytes,
            });
          });

          Readable.from(fileBuffer).pipe(stream);
        });
      };

      return await uploadStream();
    } catch (error) {
      this.logger.error('Error uploading image', error, 'CloudinaryService');
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      const result = (await cloudinary.uploader.destroy(publicId)) as CloudinaryDestroyResponse;

      if (result.result !== 'ok') {
        this.logger.warn(
          `Cloudinary responded with "${result.result}" while deleting image with publicId: ${publicId}.`,
          'CloudinaryService',
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to delete image with publicId: ${publicId}.`,
        error,
        'CloudinaryService',
      );
    }
  }
}
