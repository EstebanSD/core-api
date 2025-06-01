import { Readable } from 'stream';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { IStorageService, UploadedFile, UploadFileParams } from '../interfaces/storage.interface';

type CloudinaryDestroyResponse = {
  result: 'ok' | 'not found' | 'error';
};

@Injectable()
export class CloudinaryService implements IStorageService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLoggerService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(params: UploadFileParams): Promise<UploadedFile> {
    const { fileBuffer, filename, mimetype, folder, resourceType = 'auto' } = params;
    try {
      const uploadOptions: UploadApiOptions = {
        resource_type: resourceType,
        public_id: filename,
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
      this.logger.error('Error uploading image', error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      const result = (await cloudinary.uploader.destroy(publicId)) as CloudinaryDestroyResponse;

      if (result.result !== 'ok') {
        throw new Error(`Failed to delete image with publicId ${publicId}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting image`, error);
      throw new InternalServerErrorException('Failed to delete image');
    }
  }
}
