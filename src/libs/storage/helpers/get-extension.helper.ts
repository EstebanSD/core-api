/**
 * Returns a file extension from a given MIME type.
 *
 * This method handles common special cases explicitly to ensure
 * clean extensions (e.g., "svg" instead of "svg+xml").
 *
 * For more robust or dynamic handling, consider using the 'mime-types' library:
 * https://www.npmjs.com/package/mime-types
 *
 * Example:
 * import { extension } from 'mime-types';
 * const ext = extension(mimetype); // e.g., 'svg'
 */
export function getExtensionFromMime(mimetype: string): string {
  switch (mimetype) {
    case 'image/svg+xml':
      return 'svg';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'application/pdf':
      return 'pdf';
    default:
      return mimetype.split('/')[1] ?? 'bin';
  }
}
