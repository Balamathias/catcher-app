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

// Minimal base64 decoder (no padding issues) to Uint8Array for RN without atob
const base64ToUint8Array = (b64: string): Uint8Array => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = b64.replace(/\s+/g, '');
  let outputLength = (str.length * 3) / 4 - (str.endsWith('==') ? 2 : str.endsWith('=') ? 1 : 0);
  const bytes = new Uint8Array(outputLength | 0);

  let enc1 = 0, enc2 = 0, enc3 = 0, enc4 = 0;
  let i = 0, p = 0;
  while (i < str.length) {
    enc1 = chars.indexOf(str.charAt(i++));
    enc2 = chars.indexOf(str.charAt(i++));
    enc3 = chars.indexOf(str.charAt(i++));
    enc4 = chars.indexOf(str.charAt(i++));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    bytes[p++] = chr1;
    if (enc3 !== 64 && p < bytes.length) bytes[p++] = chr2;
    if (enc4 !== 64 && p < bytes.length) bytes[p++] = chr3;
  }
  return bytes;
};

export const uploadLocalImage = async (image: Img) => {
  const extension = getExtension(image.uri, image.filename);
  const contentType = getContentType(extension);
  const storagePath = createStoragePath(extension);
  let body: ArrayBufferView | ArrayBuffer;

  if (image.base64) {
    body = base64ToUint8Array(image.base64);
  } else if (/^https?:\/\//i.test(image.uri)) {
    // Fallback for http(s) URLs (not file://) if base64 is missing
    const resp = await fetch(image.uri);
    if (!resp.ok) throw new Error('Unable to read image from URL.');
    body = await resp.arrayBuffer();
  } else {
    throw new Error('Unable to read selected image. Please re-select the image.');
  }

  const { error } = await supabase.storage.from('images').upload(storagePath, body as any, {
    contentType,
    cacheControl: '3600'
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
