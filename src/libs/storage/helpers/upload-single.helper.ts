import { IStorageService } from '../interfaces';

export async function uploadSingle(
  storageService: IStorageService,
  folder: string,
  fileBuffer?: Buffer,
  filename?: string,
  mimetype?: string,
): Promise<{ publicId: string; url: string } | undefined> {
  if (!fileBuffer || !filename || !mimetype) return;

  const uploaded = await storageService.uploadFile({
    fileBuffer,
    filename,
    mimetype,
    folder,
  });

  return {
    publicId: uploaded.publicId,
    url: uploaded.url,
  };
}
