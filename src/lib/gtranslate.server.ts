/**
 * Google Cloud Translation API (v2) helper.
 * Server-only: reads the API key inside the exported functions, never at module scope.
 */

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

function apiKey(): string | null {
  return process.env["GOOGLE_TRANSLATE_API_KEY"] ?? process.env["GOOGLE_API_KEY"] ?? null;
}

function decodeEntities(s: string): string {
  return s
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ");
}

/** Splits into batches that respect Google's per-request segment and size limits. */
function batches(texts: string[]): string[][] {
  const out: string[][] = [];
  let cur: string[] = [];
  let size = 0;
  for (const t of texts) {
    if (cur.length >= 60 || size + t.length > 20000) {
      if (cur.length) out.push(cur);
      cur = [];
      size = 0;
    }
    cur.push(t);
    size += t.length;
  }
  if (cur.length) out.push(cur);
  return out;
}

/**
 * Translates a list of plain-text strings into `target`.
 * Returns null when the key is missing or the API fails, so callers can fall back to English.
 */
export async function gtranslate(texts: string[], target: string, source = "en"): Promise<string[] | null> {
  const key = apiKey();
  if (!key) {
    console.error("[gtranslate] GOOGLE_TRANSLATE_API_KEY is not configured");
    return null;
  }
  if (target === source) return texts;

  const result: string[] = [];
  for (const chunk of batches(texts)) {
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: chunk, source, target, format: "text" }),
    });
    if (!res.ok) {
      console.error("[gtranslate] API error", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { data?: { translations?: { translatedText: string }[] } };
    const list = json.data?.translations;
    if (!list || list.length !== chunk.length) {
      console.error("[gtranslate] unexpected response shape");
      return null;
    }
    for (const item of list) result.push(decodeEntities(item.translatedText));
  }
  return result;
}

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/** Translates every string leaf of a JSON value, keeping the exact shape. */
export async function gtranslateDeep<T extends Json>(value: T, target: string): Promise<T | null> {
  const strings: string[] = [];

  const collect = (v: Json): void => {
    if (typeof v === "string") {
      if (v.trim()) strings.push(v);
      return;
    }
    if (Array.isArray(v)) return v.forEach(collect);
    if (v && typeof v === "object") return Object.values(v).forEach(collect);
  };
  collect(value);

  if (!strings.length) return value;
  const translated = await gtranslate(strings, target);
  if (!translated) return null;

  let i = 0;
  const rebuild = (v: Json): Json => {
    if (typeof v === "string") return v.trim() ? (translated[i++] ?? v) : v;
    if (Array.isArray(v)) return v.map(rebuild);
    if (v && typeof v === "object") {
      return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, rebuild(val)]));
    }
    return v;
  };

  return rebuild(value) as T;
}
