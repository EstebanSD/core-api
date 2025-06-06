import { BadRequestException, UseInterceptors, applyDecorators } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

type MultiParams = {
  fieldName?: string;
  maxCount?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
  deniedTypes?: string[];
};

export function MultiImageUploadInterceptor(params: MultiParams = {}) {
  const {
    fieldName = 'files',
    maxCount = 10,
    maxSizeMB = 2,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    deniedTypes = [],
  } = params;

  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, {
        storage: memoryStorage(),
        limits: {
          fileSize: maxSizeMB * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
          const { mimetype } = file;

          if (deniedTypes.includes(mimetype)) {
            return cb(new BadRequestException(`Image type ${mimetype} is not allowed`), false);
          }

          if (!allowedTypes.includes(mimetype)) {
            return cb(new BadRequestException(`Invalid image type: ${mimetype}`), false);
          }

          cb(null, true);
        },
      }),
    ),
  );
}
