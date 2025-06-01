import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLoggerService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.getOrThrow('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File, folder?: string): Promise<UploadApiResponse> {
    const filePath = file.path;
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'image',
      });
      this.logger.log(`Uploaded image to Cloudinary: ${result.secure_url}`);

      return result;
    } catch (error) {
      this.logger.error('Error uploading image to Cloudinary', error, CloudinaryService.name);
      throw error;
    }
  }

  // You can add methods to delete images, etc.
}
