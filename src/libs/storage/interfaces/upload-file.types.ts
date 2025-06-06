export interface StorageUploadParams {
  fileBuffer: Buffer;
  filename: string;
  mimetype: string;
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw';
}

export interface StorageFileMetadata {
  url: string;
  publicId: string;
  size?: number;
  format?: string;
  resourceType?: 'image' | 'video' | 'raw';
}
