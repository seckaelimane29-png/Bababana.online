import { create } from 'zustand';

import { translate, type TranslationKey } from '../i18n';
import type { UiLanguage } from '../types';

type Theme = 'light' | 'dark';

function readStored<T extends string>(key: string, fallback: T, valid: T[]): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && valid.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function systemTheme(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

interface SettingsState {
  uiLanguage: UiLanguage;
  theme: Theme;
  setUiLanguage: (lang: UiLanguage) => void;
  toggleTheme: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  uiLanguage: readStored<UiLanguage>('waxal_lang', 'wo', ['wo', 'fr', 'en']),
  theme: readStored<Theme>('waxal_theme', systemTheme(), ['light', 'dark']),

  setUiLanguage: (lang) => {
    try {
      localStorage.setItem('waxal_lang', lang);
    } catch {
      /* ignore */
    }
    set({ uiLanguage: lang });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('waxal_theme', next);
    } catch {
      /* ignore */
    }
    set({ theme: next });
  },

  t: (key, vars) => translate(get().uiLanguage, key, vars),
}));
