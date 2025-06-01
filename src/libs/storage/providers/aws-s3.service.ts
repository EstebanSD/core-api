import { IStorageService, UploadedFile, UploadFileParams } from '../interfaces/storage.interface';

export class S3Service implements IStorageService {
  async uploadFile(params: UploadFileParams): Promise<UploadedFile> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      url: `http://localhost/fake/${params.filename}`,
      publicId: `mock-${params.filename}`,
      format: params.mimetype.split('/')[1],
      resourceType: 'raw',
      size: params.fileBuffer.length,
    };
  }

  async deleteFile(publicId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Mock delete file with publicId: ${publicId}`);
  }
}
