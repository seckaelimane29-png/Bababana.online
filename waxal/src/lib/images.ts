import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { saveVideo } from '@/lib/webVideoStore';

const MAX_SIDE = 1080;

/** Web: shrink the picture and keep it as a data: URL (small enough to live inside the saved project). */
async function shrinkForWeb(uri: string, mime?: string | null): Promise<{ uri: string; aspect: number }> {
  const img = new window.Image();
  img.src = uri;
  await img.decode();
  const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * k));
  const h = Math.max(1, Math.round(img.naturalHeight * k));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
  // PNG / WebP / GIF can be see-through (stickers, logos): keep transparency. Photos become JPEG.
  const transparent = /png|webp|gif/i.test(mime ?? '') || /^data:image\/(png|webp|gif)/i.test(uri);
  return { uri: canvas.toDataURL(transparent ? 'image/png' : 'image/jpeg', 0.88), aspect: h / w };
}

export type PickedOverlay = { kind: 'image' | 'video'; uri: string; aspect: number; duration?: number };

/** Lets the user pick a picture or a video for an overlay. Returns a URI that stays valid and the media's height/width. */
export async function pickOverlay(id: string): Promise<PickedOverlay | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.9, allowsEditing: false });
  const a = res.canceled ? null : res.assets?.[0];
  if (!a) return null;
  const aspect = a.width && a.height ? a.height / a.width : 1;
  if (a.type === 'video') {
    // Native pickers report milliseconds, the web picker reports seconds.
    const duration = Platform.OS === 'web' ? (a.duration ?? 0) : (a.duration ?? 0) / 1000;
    if (Platform.OS === 'web') {
      await saveVideo(id, a.uri);
      return { kind: 'video', uri: a.uri, aspect, duration };
    }
    return { kind: 'video', uri: await keepFile(a.uri, id, 'mp4'), aspect, duration };
  }
  if (Platform.OS === 'web') return { kind: 'image', ...(await shrinkForWeb(a.uri, a.mimeType)) };
  return { kind: 'image', uri: await keepFile(a.uri, id, 'jpg'), aspect };
}

async function keepFile(uri: string, id: string, fallbackExt: string): Promise<string> {
  const dir = new Directory(Paths.document, 'overlays');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const ext = (uri.split('?')[0].split('.').pop() || fallbackExt).toLowerCase().slice(0, 4);
  const dest = new File(dir, `${id}.${ext}`);
  await new File(uri).copy(dest);
  return dest.uri;
}

/** The picture as a data: URL, for sending to the render server. */
export async function imageDataUrl(uri: string): Promise<string> {
  if (uri.startsWith('data:')) return uri;
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'heic' ? 'image/heic' : 'image/jpeg';
  return `data:${mime};base64,${await new File(uri).base64()}`;
}
