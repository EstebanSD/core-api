import { IStorageService } from '../interfaces';

export async function uploadMultiple(
  storageService: IStorageService,
  folder: string,
  files: Express.Multer.File[],
): Promise<{ publicId: string; url: string }[]> {
  if (!files.length) return [];

  const uploads = await Promise.all(
    files.map((file) =>
      storageService.uploadFile({
        fileBuffer: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype,
        folder,
      }),
    ),
  );

  return uploads.map(({ url, publicId }) => ({ url, publicId }));
}
