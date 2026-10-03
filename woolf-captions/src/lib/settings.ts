import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

export type Settings = {
  openaiKey: string;
  /** Optional Woolf render/AI server (see /server). Needed for burned-in video export. */
  serverUrl: string;
  /** Optional shared secret if the server sets WOOLF_API_TOKEN. */
  serverToken: string;
  /** Who transcribes: 'device' calls OpenAI from the phone with the key above, 'server' uses the server. */
  transcribeVia: 'device' | 'server';
  chatModel: string;
  defaultLanguage: string;
};

const DEFAULTS: Settings = {
  openaiKey: '',
  serverUrl: '',
  serverToken: '',
  transcribeVia: 'device',
  chatModel: 'gpt-4o-mini',
  defaultLanguage: 'auto',
};

const KEY_STORE = 'woolf.openaiKey';
const SETTINGS_STORE = 'woolf.settings';

async function readSecret(): Promise<string> {
  try {
    if (Platform.OS === 'web') return (await AsyncStorage.getItem(KEY_STORE)) ?? '';
    return (await SecureStore.getItemAsync(KEY_STORE)) ?? '';
  } catch {
    return '';
  }
}

async function writeSecret(v: string) {
  if (Platform.OS === 'web') return AsyncStorage.setItem(KEY_STORE, v);
  if (!v) return SecureStore.deleteItemAsync(KEY_STORE);
  return SecureStore.setItemAsync(KEY_STORE, v);
}

type SettingsState = Settings & {
  loaded: boolean;
  load: () => Promise<void>;
  save: (patch: Partial<Settings>) => Promise<void>;
};

export const useSettings = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  loaded: false,
  load: async () => {
    const [raw, key] = await Promise.all([AsyncStorage.getItem(SETTINGS_STORE), readSecret()]);
    const stored = raw ? (JSON.parse(raw) as Partial<Settings>) : {};
    set({ ...DEFAULTS, ...stored, openaiKey: key, loaded: true });
  },
  save: async (patch) => {
    set(patch);
    const { openaiKey, loaded: _l, load: _a, save: _b, ...rest } = get();
    await AsyncStorage.setItem(SETTINGS_STORE, JSON.stringify(rest));
    if (patch.openaiKey !== undefined) await writeSecret(openaiKey);
  },
}));

export function serverBase(): string {
  return useSettings.getState().serverUrl.trim().replace(/\/+$/, '');
}

export function serverHeaders(): Record<string, string> {
  const token = useSettings.getState().serverToken.trim();
  return token ? { 'x-woolf-token': token } : {};
}
