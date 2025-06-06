import { CustomLoggerService } from 'src/common/logger/custom-logger.service';
import { IStorageService, StorageFileMetadata, StorageUploadParams } from '../interfaces';

/**
 * Temporary mock service for S3 storage.
 * This stub is used during development and does not perform any real upload/delete operations.
 */
export class S3Service implements IStorageService {
  constructor(private readonly logger: CustomLoggerService) {}

  async uploadFile(params: StorageUploadParams): Promise<StorageFileMetadata> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      url: `http://localhost/mock-s3/${params.filename}`,
      publicId: `mock-s3-${params.filename}`,
      format: params.mimetype.split('/')[1] ?? 'bin',
      resourceType: 'raw',
      size: params.fileBuffer.length,
    };
  }

  async deleteFile(publicId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.logger.log(`[S3Service Stub] Deleted: ${publicId}`);
  }
}
