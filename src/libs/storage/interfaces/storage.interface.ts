import { StorageUploadParams, StorageFileMetadata } from './upload-file.types';

export interface IStorageService {
  uploadFile(params: StorageUploadParams): Promise<StorageFileMetadata>;
  deleteFile(fileKey: string, type?: 'image' | 'video' | 'raw'): Promise<void>;
}
