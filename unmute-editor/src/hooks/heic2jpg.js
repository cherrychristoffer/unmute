import heic2any from 'heic2any';
import { isHEICorHEIF } from './helper';

export const convertHeicToJpg = async (file, path) => {
  let finalFile = file;
  let finalPath = path;

  const isHEIC = file.type === 'image/heic';
  const isHEIF = file.type === 'image/heif';
  const isHEICorHEIFFile = isHEIC || isHEIF || isHEICorHEIF(file.name);

  if (!isHEICorHEIFFile) {
    return { finalFile, finalPath };
  }

  console.log("Converting HEIC file:", file.type);

  try {
    const originalBlob = new Blob([file], { type: 'image/heif' });

    // Convert HEIC to JPEG
    const blob = await heic2any({
      blob: originalBlob,
      toType: 'image/jpeg', // or 'image/png'
      quality: 1, // Adjust quality (0.0 to 1.0)
    });

    // Replace heif or heic with jpg in the filename
    const newName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');

    // Create a file-like object to upload
    const convertedFile = new File([blob], newName, {
      type: 'image/jpeg',
    });

    // Update the final path
    finalPath = path.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
    finalFile = convertedFile;
  } catch (error) {
    console.error("Error converting HEIC file:", error);
  }

  return { finalFile, finalPath };
}
