import { BadRequestException, UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export function ImageUploadInterceptor(fieldName = 'file', maxSizeMB = 2) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: memoryStorage(),
        limits: {
          fileSize: maxSizeMB * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.startsWith('image/')) {
            return cb(new BadRequestException('Only image files are allowed'), false);
          }
          cb(null, true);
        },
      }),
    ),
  );
}
