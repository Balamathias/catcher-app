import { supabase } from '@/lib/supabase';
import { ALLOWED_EXTENSIONS } from './constants';
import type { Img } from './types';

const getExtension = (uri: string, filename?: string | null) => {
  const candidate = (filename || uri).split('?')[0].split('.').pop()?.toLowerCase();
  if (candidate && ALLOWED_EXTENSIONS.includes(candidate as typeof ALLOWED_EXTENSIONS[number])) {
    return candidate;
  }
  return 'jpg';
};

const getContentType = (extension: string) => {
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
    case 'heif':
      return 'image/heic';
    case 'jpeg':
    case 'jpg':
    default:
      return 'image/jpeg';
  }
};

const createStoragePath = (extension: string) => {
  const random = Math.random().toString(36).slice(2, 10);
  return `items/${Date.now()}-${random}.${extension}`;
};

const toBlob = async (image: Img, contentType: string) => {
  if (image.base64) {
    const dataUrl = `data:${contentType};base64,${image.base64}`;
    const data = await fetch(dataUrl);
    return data.blob();
  }

  const response = await fetch(image.uri);
  if (!response.ok) {
    throw new Error('Unable to read selected image.');
  }
  return response.blob();
};

export const uploadLocalImage = async (image: Img) => {
  const extension = getExtension(image.uri, image.filename);
  const contentType = getContentType(extension);
  const storagePath = createStoragePath(extension);
  const blob = await toBlob(image, contentType);

  const { error } = await supabase.storage.from('images').upload(storagePath, blob, {
    // contentType,
    // cacheControl: '3600'
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('images').getPublicUrl(storagePath);
  if (!data?.publicUrl) {
    throw new Error('Unable to retrieve uploaded image URL.');
  }

  return data.publicUrl;
};

export const uploadLocalImages = async (images: Img[]) => {
  const updated = await Promise.all(
    images.map(async image => {
      if (image.kind === 'file') {
        const remoteUrl = await uploadLocalImage(image);
        return { ...image, uri: remoteUrl, kind: 'url', base64: null } as Img;
      }
      return image;
    })
  );

  return updated;
};
