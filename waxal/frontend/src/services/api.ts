import type {
  ApiError,
  CaptionLanguage,
  CaptionResponse,
  CaptionVariant,
  HistoryItem,
  Platform,
  PlansResponse,
  TokenResponse,
  Tone,
  UploadResponse,
  User,
} from '../types';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';
const API = `${BASE_URL}/api/v1`;

const TOKEN_KEY = 'waxal_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode — session only */
  }
}

export class RequestError extends Error {
  code: string;
  status: number;

  constructor(err: ApiError) {
    super(err.message);
    this.code = err.code;
    this.status = err.status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${API}${path}`, { ...options, headers });
  } catch {
    throw new RequestError({ code: 'NETWORK', message: 'Network error', status: 0 });
  }

  if (!response.ok) {
    let err: ApiError = {
      code: 'UNKNOWN',
      message: `Request failed (${response.status})`,
      status: response.status,
    };
    try {
      const data = await response.json();
      if (data?.error) err = data.error;
    } catch {
      /* non-JSON error body */
    }
    throw new RequestError(err);
  }
  return response.json() as Promise<T>;
}

// ---------- Auth ----------

export const api = {
  register(email: string, password: string, displayName: string): Promise<TokenResponse> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name: displayName }),
    });
  },

  login(email: string, password: string): Promise<TokenResponse> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  me(): Promise<User> {
    return request('/auth/me');
  },

  // ---------- Images / captions ----------

  upload(file: File): Promise<UploadResponse> {
    const form = new FormData();
    form.append('file', file);
    return request('/upload', { method: 'POST', body: form });
  },

  generate(params: {
    image_id: number;
    tone: Tone;
    platform: Platform;
    language: CaptionLanguage;
    include_hashtags: boolean;
    context?: string;
    count?: number;
  }): Promise<CaptionResponse> {
    return request('/generate', { method: 'POST', body: JSON.stringify(params) });
  },

  refine(params: {
    original_caption: string;
    instruction: string;
    tone: Tone;
    platform: Platform;
    language: CaptionLanguage;
  }): Promise<CaptionVariant> {
    return request('/refine', { method: 'POST', body: JSON.stringify(params) });
  },

  // ---------- History ----------

  history(limit = 50, offset = 0): Promise<HistoryItem[]> {
    return request(`/history?limit=${limit}&offset=${offset}`);
  },

  deleteHistory(id: number): Promise<{ success: boolean }> {
    return request(`/history/${id}`, { method: 'DELETE' });
  },

  favorite(id: number, favorite: boolean): Promise<HistoryItem> {
    return request(`/history/${id}/favorite`, {
      method: 'POST',
      body: JSON.stringify({ favorite }),
    });
  },

  // ---------- Billing ----------

  plans(): Promise<PlansResponse> {
    return request('/billing/plans');
  },

  upgrade(): Promise<User> {
    return request('/billing/upgrade', { method: 'POST' });
  },
};

export function imageUrl(path: string): string {
  if (!path) return '';
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}
