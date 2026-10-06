import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { create } from 'zustand';

import { uid } from '@/lib/id';
import { DEFAULT_STYLE } from '@/lib/templates';
import { copyVideo, deleteVideo, saveVideo, videoUrl } from '@/lib/webVideoStore';
import type { Project, Selection } from '@/types';

const INDEX_KEY = 'waxal.projects';
const projectKey = (id: string) => `waxal.project.${id}`;
const HISTORY_LIMIT = 60;

export type ProjectSummary = Pick<Project, 'id' | 'name' | 'updatedAt' | 'duration' | 'videoUri' | 'width' | 'height'> & {
  captionCount: number;
};

function summarize(p: Project): ProjectSummary {
  return {
    id: p.id,
    name: p.name,
    updatedAt: p.updatedAt,
    duration: p.duration,
    videoUri: p.videoUri,
    width: p.width,
    height: p.height,
    captionCount: p.captions.length,
  };
}

// ---------------- library ----------------

type LibraryState = {
  projects: ProjectSummary[];
  loaded: boolean;
  load: () => Promise<void>;
  create: (video: { uri: string; duration: number; width: number; height: number; fileName?: string | null }) => Promise<Project>;
  remove: (id: string) => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
  duplicate: (id: string) => Promise<void>;
};

async function persistIndex(list: ProjectSummary[]) {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(list));
}

export async function loadProject(id: string): Promise<Project | null> {
  const raw = await AsyncStorage.getItem(projectKey(id));
  return raw ? (JSON.parse(raw) as Project) : null;
}

async function saveProject(p: Project) {
  await AsyncStorage.setItem(projectKey(p.id), JSON.stringify(p));
  const lib = useLibrary.getState();
  const list = [summarize(p), ...lib.projects.filter((x) => x.id !== p.id)].sort((a, b) => b.updatedAt - a.updatedAt);
  useLibrary.setState({ projects: list });
  await persistIndex(list);
}

/** Copy the picked video into app storage so it survives picker cache cleanup. */
async function importVideo(uri: string, id: string): Promise<string> {
  if (Platform.OS === 'web') {
    await saveVideo(id, uri);
    return uri;
  }
  const dir = new Directory(Paths.document, 'videos');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const ext = (uri.split('?')[0].split('.').pop() || 'mp4').toLowerCase().slice(0, 4);
  const dest = new File(dir, `${id}.${ext}`);
  await new File(uri).copy(dest);
  return dest.uri;
}

export const useLibrary = create<LibraryState>((set, get) => ({
  projects: [],
  loaded: false,
  load: async () => {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    set({ projects: raw ? JSON.parse(raw) : [], loaded: true });
  },
  create: async (video) => {
    const id = uid('p');
    const videoUri = await importVideo(video.uri, id);
    const duration = video.duration; // seconds
    const now = Date.now();
    const project: Project = {
      id,
      name: video.fileName?.replace(/\.[^.]+$/, '') || `Project ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      updatedAt: now,
      videoUri,
      duration,
      width: video.width || 1080,
      height: video.height || 1920,
      clips: duration > 0 ? [{ id: uid('k'), start: 0, end: duration }] : [],
      captions: [],
      texts: [],
      style: DEFAULT_STYLE,
      volume: 1,
      muted: false,
      speed: 1,
      language: null,
    };
    await saveProject(project);
    return project;
  },
  remove: async (id) => {
    const p = await loadProject(id);
    if (Platform.OS === 'web') await deleteVideo(id);
    if (p && Platform.OS !== 'web') {
      try {
        const f = new File(p.videoUri);
        if (f.exists) f.delete();
      } catch {}
    }
    await AsyncStorage.removeItem(projectKey(id));
    const list = get().projects.filter((x) => x.id !== id);
    set({ projects: list });
    await persistIndex(list);
  },
  rename: async (id, name) => {
    const p = await loadProject(id);
    if (!p) return;
    await saveProject({ ...p, name, updatedAt: Date.now() });
  },
  duplicate: async (id) => {
    const p = await loadProject(id);
    if (!p) return;
    const nid = uid('p');
    let videoUri = p.videoUri;
    if (Platform.OS === 'web') await copyVideo(id, nid);
    else {
      const dest = new File(new Directory(Paths.document, 'videos'), `${nid}.${p.videoUri.split('.').pop()}`);
      await new File(p.videoUri).copy(dest);
      videoUri = dest.uri;
    }
    await saveProject({ ...p, id: nid, videoUri, name: `${p.name} copy`, createdAt: Date.now(), updatedAt: Date.now() });
  },
}));

// ---------------- editor (open project + undo/redo) ----------------

type EditorState = {
  project: Project | null;
  past: Project[];
  future: Project[];
  selection: Selection;
  open: (id: string) => Promise<boolean>;
  close: () => void;
  /** Apply an edit. history=false is for live slider drags (call checkpoint() first). */
  update: (fn: (p: Project) => Project, opts?: { history?: boolean }) => void;
  checkpoint: () => void;
  undo: () => void;
  redo: () => void;
  select: (s: Selection) => void;
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(p: Project) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveProject(p), 400);
}

export const useEditor = create<EditorState>((set, get) => ({
  project: null,
  past: [],
  future: [],
  selection: null,
  open: async (id) => {
    let p = await loadProject(id);
    if (p && Platform.OS === 'web') {
      const url = await videoUrl(id);
      if (url) p = { ...p, videoUri: url };
    }
    set({ project: p, past: [], future: [], selection: null });
    return !!p;
  },
  close: () => {
    const p = get().project;
    if (saveTimer) clearTimeout(saveTimer);
    if (p) saveProject(p);
    set({ project: null, past: [], future: [], selection: null });
  },
  update: (fn, opts) => {
    const cur = get().project;
    if (!cur) return;
    const next = { ...fn(cur), updatedAt: Date.now() };
    if (opts?.history === false) {
      set({ project: next });
    } else {
      set({ project: next, past: [...get().past, cur].slice(-HISTORY_LIMIT), future: [] });
    }
    scheduleSave(next);
  },
  checkpoint: () => {
    const cur = get().project;
    if (cur) set({ past: [...get().past, cur].slice(-HISTORY_LIMIT), future: [] });
  },
  undo: () => {
    const { past, project, future } = get();
    if (!past.length || !project) return;
    const prev = past[past.length - 1];
    set({ project: prev, past: past.slice(0, -1), future: [project, ...future], selection: null });
    scheduleSave(prev);
  },
  redo: () => {
    const { past, project, future } = get();
    if (!future.length || !project) return;
    const next = future[0];
    set({ project: next, past: [...past, project], future: future.slice(1), selection: null });
    scheduleSave(next);
  },
  select: (selection) => set({ selection }),
}));
