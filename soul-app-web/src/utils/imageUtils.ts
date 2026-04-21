import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file.
 *
 * @param file The original image file
 * @returns A promise that resolves to the compressed File object, or the original file if compression is skipped or fails.
 */
export async function compressImage(file: File): Promise<File> {
  // Fallback for unsupported formats (e.g., GIF)
  if (file.type === 'image/gif') {
    return file;
  }


  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    // Ensure we return a File object (browser-image-compression returns a File or Blob)
    // If it returns a Blob, we can wrap it back into a File if needed,
    // but the library typically returns a File in modern browsers.
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed, returning original file:', error);
    return file;
  }
}
