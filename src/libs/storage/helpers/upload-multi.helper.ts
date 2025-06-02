import { IStorageService, UploadFileParams } from '../interfaces';

export async function uploadMultiple(
  storageService: IStorageService,
  folder: string,
  files: UploadFileParams[],
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
