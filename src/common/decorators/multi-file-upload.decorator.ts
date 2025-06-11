import { BadRequestException, UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

type FieldConfig = {
  name: string;
  maxCount?: number;
  allowedTypes?: string[];
  deniedTypes?: string[];
};

export const MultiFieldUploadInterceptor = (fields: FieldConfig[]) => {
  return applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor(
        fields.map(({ name, maxCount = 1 }) => ({ name, maxCount })),
        {
          storage: memoryStorage(),
          fileFilter: (req, file, cb) => {
            const field = fields.find((f) => f.name === file.fieldname);

            if (!field) {
              return cb(new BadRequestException(`Unexpected field: ${file.fieldname}`), false);
            }

            const { allowedTypes, deniedTypes } = field;

            if (deniedTypes?.includes(file.mimetype)) {
              return cb(new BadRequestException(`Denied file type: ${file.mimetype}`), false);
            }

            if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
              return cb(
                new BadRequestException(
                  `Unsupported file type "${file.mimetype}" for field "${file.fieldname}"`,
                ),
                false,
              );
            }

            cb(null, true);
          },
        },
      ),
    ),
  );
};
