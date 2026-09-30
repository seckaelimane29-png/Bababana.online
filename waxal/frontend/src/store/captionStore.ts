import { create } from 'zustand';

import { api, RequestError } from '../services/api';
import { useAuthStore } from './authStore';
import type {
  CaptionLanguage,
  CaptionVariant,
  HistoryItem,
  Platform,
  Tone,
} from '../types';

type ToastType = 'success' | 'error' | 'info';

interface CaptionState {
  // upload
  imageId: number | null;
  imagePreview: string | null; // local object URL for instant preview
  isUploading: boolean;
  uploadError: string | null;

  // generation options
  selectedTone: Tone;
  selectedPlatform: Platform;
  captionLanguage: CaptionLanguage;
  includeHashtags: boolean;
  context: string;

  // results
  isGenerating: boolean;
  captions: CaptionVariant[];
  imageDescription: string;
  refiningId: string | null;

  // history
  history: HistoryItem[];
  isHistoryOpen: boolean;

  // upgrade modal
  isUpgradeOpen: boolean;

  toast: { message: string; type: ToastType } | null;

  uploadImage: (file: File) => Promise<void>;
  clearImage: () => void;
  setTone: (tone: Tone) => void;
  setPlatform: (platform: Platform) => void;
  setCaptionLanguage: (lang: CaptionLanguage) => void;
  setIncludeHashtags: (v: boolean) => void;
  setContext: (v: string) => void;
  generate: (messages: { success: string; error: string }) => Promise<void>;
  refine: (
    caption: CaptionVariant,
    instruction: string,
    errorMessage: string,
  ) => Promise<void>;
  loadHistory: () => Promise<void>;
  removeFromHistory: (id: number, message: string) => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  loadHistoryItem: (item: HistoryItem) => void;
  toggleHistory: () => void;
  setUpgradeOpen: (open: boolean) => void;
  showToast: (message: string, type: ToastType) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useCaptionStore = create<CaptionState>((set, get) => ({
  imageId: null,
  imagePreview: null,
  isUploading: false,
  uploadError: null,

  selectedTone: 'casual',
  selectedPlatform: 'instagram',
  captionLanguage: 'wolof',
  includeHashtags: true,
  context: '',

  isGenerating: false,
  captions: [],
  imageDescription: '',
  refiningId: null,

  history: [],
  isHistoryOpen: false,
  isUpgradeOpen: false,
  toast: null,

  uploadImage: async (file) => {
    const preview = URL.createObjectURL(file);
    set({ isUploading: true, uploadError: null, imagePreview: preview });
    try {
      const res = await api.upload(file);
      set({ imageId: res.id, isUploading: false });
    } catch (e) {
      URL.revokeObjectURL(preview);
      set({
        isUploading: false,
        imagePreview: null,
        imageId: null,
        uploadError: e instanceof RequestError ? e.message : 'Upload failed',
      });
    }
  },

  clearImage: () => {
    const { imagePreview } = get();
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    set({ imageId: null, imagePreview: null, uploadError: null, captions: [] });
  },

  setTone: (tone) => set({ selectedTone: tone }),
  setPlatform: (platform) => set({ selectedPlatform: platform }),
  setCaptionLanguage: (lang) => set({ captionLanguage: lang }),
  setIncludeHashtags: (v) => set({ includeHashtags: v }),
  setContext: (v) => set({ context: v }),

  generate: async (messages) => {
    const s = get();
    if (s.imageId == null || s.isGenerating) return;
    set({ isGenerating: true });
    try {
      const res = await api.generate({
        image_id: s.imageId,
        tone: s.selectedTone,
        platform: s.selectedPlatform,
        language: s.captionLanguage,
        include_hashtags: s.includeHashtags,
        context: s.context.trim() || undefined,
      });
      set({
        captions: res.captions,
        imageDescription: res.image_description,
        isGenerating: false,
      });
      get().showToast(messages.success, 'success');
      void get().loadHistory();
      void useAuthStore.getState().refreshUser();
    } catch (e) {
      set({ isGenerating: false });
      if (e instanceof RequestError && e.code === 'QUOTA_EXCEEDED') {
        set({ isUpgradeOpen: true });
        get().showToast(e.message, 'error');
      } else {
        get().showToast(
          e instanceof RequestError ? e.message : messages.error,
          'error',
        );
      }
    }
  },

  refine: async (caption, instruction, errorMessage) => {
    const s = get();
    if (s.refiningId) return;
    set({ refiningId: caption.id });
    try {
      const refined = await api.refine({
        original_caption: caption.text,
        instruction,
        tone: s.selectedTone,
        platform: s.selectedPlatform,
        language: s.captionLanguage,
      });
      set({
        captions: get().captions.map((c) =>
          c.id === caption.id ? { ...refined, hashtags: c.hashtags } : c,
        ),
        refiningId: null,
      });
    } catch (e) {
      set({ refiningId: null });
      get().showToast(e instanceof RequestError ? e.message : errorMessage, 'error');
    }
  },

  loadHistory: async () => {
    try {
      const history = await api.history();
      set({ history });
    } catch {
      /* silent — history refresh is best-effort */
    }
  },

  removeFromHistory: async (id, message) => {
    try {
      await api.deleteHistory(id);
      set({ history: get().history.filter((h) => h.id !== id) });
      get().showToast(message, 'info');
    } catch (e) {
      get().showToast(e instanceof RequestError ? e.message : 'Error', 'error');
    }
  },

  toggleFavorite: async (id) => {
    const item = get().history.find((h) => h.id === id);
    if (!item) return;
    try {
      const updated = await api.favorite(id, !item.is_favorite);
      set({ history: get().history.map((h) => (h.id === id ? updated : h)) });
    } catch {
      /* leave as-is */
    }
  },

  loadHistoryItem: (item) => {
    set({
      captions: item.captions,
      imageDescription: item.image_description,
      selectedTone: item.tone,
      selectedPlatform: item.platform,
      captionLanguage: item.language,
      isHistoryOpen: false,
    });
  },

  toggleHistory: () => {
    const next = !get().isHistoryOpen;
    set({ isHistoryOpen: next });
    if (next) void get().loadHistory();
  },

  setUpgradeOpen: (open) => set({ isUpgradeOpen: open }),

  showToast: (message, type) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: { message, type } });
    toastTimer = setTimeout(() => set({ toast: null }), 3000);
  },
}));
