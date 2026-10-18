import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

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

/** Lets the user pick a picture for an overlay. Returns a URI that stays valid and the image's height/width. */
export async function pickOverlayImage(id: string): Promise<{ uri: string; aspect: number } | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9, allowsEditing: false });
  const a = res.canceled ? null : res.assets?.[0];
  if (!a) return null;
  if (Platform.OS === 'web') return shrinkForWeb(a.uri, a.mimeType);
  const dir = new Directory(Paths.document, 'overlays');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const ext = (a.uri.split('?')[0].split('.').pop() || 'jpg').toLowerCase().slice(0, 4);
  const dest = new File(dir, `${id}.${ext}`);
  await new File(a.uri).copy(dest);
  return { uri: dest.uri, aspect: a.width && a.height ? a.height / a.width : 1 };
}

/** The picture as a data: URL, for sending to the render server. */
export async function imageDataUrl(uri: string): Promise<string> {
  if (uri.startsWith('data:')) return uri;
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'heic' ? 'image/heic' : 'image/jpeg';
  return `data:${mime};base64,${await new File(uri).base64()}`;
}
