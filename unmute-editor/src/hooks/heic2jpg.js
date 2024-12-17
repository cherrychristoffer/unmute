import heic2any from 'heic2any';

export const convertHeicToJpg = async (file, path) => {
  let finalFile = file;
  let finalPath = path;

  if (file && (file.type === 'application/octet-stream' || file.type === '')) {
    try {
      const originalBlob = new Blob([file], { type: 'image/heic' });

      // Convert HEIC to JPEG
      const blob = await heic2any({
        blob: originalBlob,
        toType: 'image/jpeg', // or 'image/png'
        quality: 1, // Adjust quality (0.0 to 1.0)
      });

      // Create a file-like object to upload
      const convertedFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
        type: 'image/jpeg',
      });

      finalFile = convertedFile;
      finalPath = path.replace(/\.heic$/i, '.jpg');
    } catch (error) {
      console.error("Error converting HEIC file:", error);
    }
  }

  return { finalFile, finalPath };
}
