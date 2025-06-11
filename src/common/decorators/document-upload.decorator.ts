import { applyDecorators, BadRequestException, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

type DocumentUploadParams = {
  fieldName?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  deniedTypes?: string[];
};

export function DocumentUploadInterceptor(params: DocumentUploadParams = {}) {
  const {
    fieldName = 'file',
    maxSizeMB = 5,
    allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text',
    ],
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
              new BadRequestException(`File type "${mimetype}" is explicitly denied.`),
              false,
            );
          }

          if (!allowedTypes.includes(mimetype)) {
            return cb(
              new BadRequestException(
                `Unsupported document type: "${mimetype}". Allowed: ${allowedTypes.join(', ')}`,
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
