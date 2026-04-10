// src/utils/cloudinary.ts
// Utility to upload images to Cloudinary via unauthenticated (unsigned) upload presets

/**
 * Upload a local image file to Cloudinary.
 * @param uri Local file URI (from expo-image-picker)
 * @returns The secure URL of the uploaded image
 */
export async function uploadToCloudinary(uri: string): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing in .env');
  }

  const formData = new FormData();
  
  // Create a file object that React Native's fetch/FormData understands
  const uriParts = uri.split('.');
  const fileType = uriParts[uriParts.length - 1];

  formData.append('file', {
    uri,
    name: `upload.${fileType}`,
    type: `image/${fileType}`,
  } as any);
  
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error('[Cloudinary Upload Error]', data);
    throw new Error(data.error?.message || 'Gagal mengunggah gambar ke Cloudinary');
  }

  return data.secure_url;
}
