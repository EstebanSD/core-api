export interface IStorageService {
  /**
   * Upload a file and return the public URL or some identifier to access it.
   * @param fileBuffer The buffer of the file to be uploaded
   * @param filename Filename, can be used for extensions or path
   * @param mimetype File MIME type (image/jpeg, application/pdf, etc.)
   */
  uploadFile(fileBuffer: Buffer, filename: string, mimetype: string): Promise<string>;

  /**
   * Deletes a file from its URL or identifier
   * @param fileKey Identifier or URL of the file to be deleted
   */
  deleteFile(fileKey: string): Promise<void>;

  /**
   * Optionally you could have methods for:
   * - obtain metadata
   * - list files
   * - etc.
   */
}
