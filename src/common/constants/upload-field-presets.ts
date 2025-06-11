import { ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES } from './upload-file-types';

export const UploadImageField = {
  name: 'image',
  maxCount: 1,
  allowedTypes: ALLOWED_IMAGE_TYPES,
  deniedTypes: ['image/svg+xml'],
};

export const UploadCvField = {
  name: 'cv',
  maxCount: 1,
  allowedTypes: ALLOWED_DOCUMENT_TYPES,
};
