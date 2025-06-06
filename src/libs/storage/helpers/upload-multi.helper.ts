import { IStorageService, StorageUploadParams } from '../interfaces';

export async function uploadMultiple(
  storageService: IStorageService,
  folder: string,
  files: StorageUploadParams[],
): Promise<{ publicId: string; url: string }[]> {
  if (!files.length) return [];

  const uploads = await Promise.all(
    files.map((file) =>
      storageService.uploadFile({
        fileBuffer: file.fileBuffer,
        filename: file.filename,
        mimetype: file.mimetype,
        folder,
      }),
    ),
  );

  return uploads.map(({ url, publicId }) => ({ url, publicId }));
}
