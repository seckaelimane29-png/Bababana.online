import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

export type SttProvider = 'elevenlabs' | 'openai';

export type Settings = {
  openaiKey: string;
  elevenlabsKey: string;
  /** Speech-to-text engine. ElevenLabs Scribe supports Wolof; OpenAI Whisper does not. */
  sttProvider: SttProvider;
  /** Optional Waxal render/AI server (see /server). Needed for burned-in video export. */
  serverUrl: string;
  /** Optional shared secret if the server sets WAXAL_API_TOKEN. */
  serverToken: string;
  /** Who transcribes: 'device' calls the provider from the phone with the keys above, 'server' uses the server. */
  transcribeVia: 'device' | 'server';
  chatModel: string;
  defaultLanguage: string;
};

const DEFAULTS: Settings = {
  openaiKey: '',
  elevenlabsKey: '',
  sttProvider: 'elevenlabs',
  // The Waxal render server on Render (see /render.yaml). The token is never stored in code.
  serverUrl: 'https://waxal-server.onrender.com',
  serverToken: '',
  transcribeVia: 'server',
  chatModel: 'gpt-4o-mini',
  defaultLanguage: 'auto',
};

const SECRETS = { openaiKey: 'waxal.openaiKey', elevenlabsKey: 'waxal.elevenlabsKey' } as const;
type SecretName = keyof typeof SECRETS;
const SETTINGS_STORE = 'waxal.settings';

async function readSecret(name: SecretName): Promise<string> {
  try {
    if (Platform.OS === 'web') return (await AsyncStorage.getItem(SECRETS[name])) ?? '';
    return (await SecureStore.getItemAsync(SECRETS[name])) ?? '';
  } catch {
    return '';
  }
}

async function writeSecret(name: SecretName, v: string) {
  if (Platform.OS === 'web') return AsyncStorage.setItem(SECRETS[name], v);
  if (!v) return SecureStore.deleteItemAsync(SECRETS[name]);
  return SecureStore.setItemAsync(SECRETS[name], v);
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
    const [raw, openaiKey, elevenlabsKey] = await Promise.all([AsyncStorage.getItem(SETTINGS_STORE), readSecret('openaiKey'), readSecret('elevenlabsKey')]);
    const stored = raw ? (JSON.parse(raw) as Partial<Settings>) : {};
    set({ ...DEFAULTS, ...stored, openaiKey, elevenlabsKey, loaded: true });
  },
  save: async (patch) => {
    set(patch);
    // Keys never go to plain storage: they live in the Keychain / Keystore.
    const { openaiKey, elevenlabsKey, loaded: _l, load: _a, save: _b, ...rest } = get();
    await AsyncStorage.setItem(SETTINGS_STORE, JSON.stringify(rest));
    if (patch.openaiKey !== undefined) await writeSecret('openaiKey', openaiKey);
    if (patch.elevenlabsKey !== undefined) await writeSecret('elevenlabsKey', elevenlabsKey);
  },
}));

/** True when AI captions can run with the current settings. */
/**
 * Built-in server settings, set by the app owner at build time (Vercel / EAS environment variables),
 * so end users never have to see or type them.
 */
const BUILT_IN_SERVER_URL = process.env.EXPO_PUBLIC_WAXAL_SERVER_URL || 'https://waxal-server.onrender.com';
const BUILT_IN_TOKEN = process.env.EXPO_PUBLIC_WAXAL_TOKEN || '';

/** True when AI captions can run with the current settings. */
export function captionsReady(s: Settings): boolean {
  if (s.transcribeVia === 'server') return !!(s.serverUrl.trim() || BUILT_IN_SERVER_URL);
  return s.sttProvider === 'elevenlabs' ? !!s.elevenlabsKey : !!s.openaiKey;
}

export function serverBase(): string {
  return (useSettings.getState().serverUrl.trim() || BUILT_IN_SERVER_URL).replace(/\/+$/, '');
}

export function serverHeaders(): Record<string, string> {
  const token = useSettings.getState().serverToken.trim() || BUILT_IN_TOKEN;
  return token ? { 'x-waxal-token': token } : {};
}
