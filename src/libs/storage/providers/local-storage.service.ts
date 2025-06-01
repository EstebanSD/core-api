import { IStorageService, UploadedFile, UploadFileParams } from '../interfaces/storage.interface';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

export class LocalStorageService implements IStorageService {
  private uploadPath = path.resolve(__dirname, '../../../uploads');

  async uploadFile({ fileBuffer, filename, mimetype }: UploadFileParams): Promise<UploadedFile> {
    const id = uuid();
    const ext =
      typeof mimetype === 'string' && mimetype.includes('/') ? mimetype.split('/')[1] : '';
    const fullFilename = `${id}-${filename}.${ext}`;
    const fullPath = path.join(this.uploadPath, fullFilename);

    await fs.mkdir(this.uploadPath, { recursive: true });
    await fs.writeFile(fullPath, fileBuffer);

    return {
      url: `http://localhost:3000/uploads/${fullFilename}`,
      publicId: fullFilename,
      format: ext,
      resourceType: 'raw',
    };
  }

  async deleteFile(publicId: string): Promise<void> {
    const fullPath = path.join(this.uploadPath, publicId);
    await fs.unlink(fullPath).catch(() => {});
  }
}
