import { BadRequestException, UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

type SingleParams = {
  fieldName?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  deniedTypes?: string[];
};

export function ImageUploadInterceptor(params: SingleParams = {}) {
  const {
    fieldName = 'file',
    maxSizeMB = 2,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    deniedTypes = [],
  } = params;

  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: memoryStorage(),
        limits: {
          fileSize: maxSizeMB * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
          const { mimetype } = file;

          if (deniedTypes.includes(mimetype)) {
            return cb(
              new BadRequestException(`Image type "${mimetype}" is explicitly denied.`),
              false,
            );
          }

          if (!allowedTypes.includes(mimetype)) {
            return cb(
              new BadRequestException(
                `Unsupported image type: "${mimetype}". Allowed: ${allowedTypes.join(', ')}`,
              ),
              false,
            );
          }

          cb(null, true);
        },
      }),
    ),
  );
}
