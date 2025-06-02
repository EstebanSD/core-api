import { ConfigService } from '@nestjs/config';
import { IStorageService, UploadedFile, UploadFileParams } from '../interfaces';
import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { InternalServerErrorException } from '@nestjs/common';

export class LocalStorageService implements IStorageService {
  private uploadPath = path.resolve(process.cwd(), 'uploads');

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CustomLoggerService,
  ) {}

  async uploadFile({ fileBuffer, filename, mimetype }: UploadFileParams): Promise<UploadedFile> {
    try {
      const id = uuid();
      const ext =
        typeof mimetype === 'string' && mimetype.includes('/') ? mimetype.split('/')[1] : '';
      const nameWithoutExt = path.parse(filename).name;
      const fullFilename = `${id}-${nameWithoutExt}.${ext}`;
      const fullPath = path.join(this.uploadPath, fullFilename);

      await fs.mkdir(this.uploadPath, { recursive: true });
      await fs.writeFile(fullPath, fileBuffer);

      const base_url = this.configService.get<string>('BASE_URL') || 'http://localhost:8080';
      return {
        url: `${base_url}/uploads/${fullFilename}`,
        publicId: fullFilename,
        format: ext,
        resourceType: 'raw',
      };
    } catch (error) {
      this.logger.error('Error uploading image', error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadPath, publicId);
      await fs.unlink(fullPath).catch(() => {});
    } catch (error) {
      this.logger.error(`Error deleting image`, error);
      throw new InternalServerErrorException('Failed to delete image');
    }
  }
}
