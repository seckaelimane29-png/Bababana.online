// Web only: blob: URLs from the picker die when Safari reloads the tab, so keep the video file itself
// in IndexedDB (keyed by project id) and make a fresh blob: URL each time a project opens.
const DB = 'waxal-videos';
const STORE = 'videos';

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const req = fn(d.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const urls = new Map<string, string>();

export async function saveVideo(id: string, uri: string): Promise<void> {
  try {
    const blob = await (await fetch(uri)).blob();
    await run('readwrite', (s) => s.put(blob, id));
    urls.set(id, uri);
  } catch {}
}

/** A playable URL for the project's video, or null when the browser no longer has it. */
export async function videoUrl(id: string): Promise<string | null> {
  const cached = urls.get(id);
  if (cached) return cached;
  try {
    const blob = await run<Blob | undefined>('readonly', (s) => s.get(id));
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urls.set(id, url);
    return url;
  } catch {
    return null;
  }
}

export async function copyVideo(from: string, to: string): Promise<void> {
  try {
    const blob = await run<Blob | undefined>('readonly', (s) => s.get(from));
    if (blob) await run('readwrite', (s) => s.put(blob, to));
  } catch {}
}

export async function deleteVideo(id: string): Promise<void> {
  urls.delete(id);
  try {
    await run('readwrite', (s) => s.delete(id));
  } catch {}
}
