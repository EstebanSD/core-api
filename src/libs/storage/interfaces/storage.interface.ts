export interface UploadFileParams {
  fileBuffer: Buffer;
  filename: string;
  mimetype: string;
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw';
}

export interface UploadedFile {
  url: string;
  publicId: string;
  size?: number;
  format?: string;
  resourceType?: 'image' | 'video' | 'raw';
}

export interface IStorageService {
  uploadFile(params: UploadFileParams): Promise<UploadedFile>;
  deleteFile(fileKey: string): Promise<void>;
}
