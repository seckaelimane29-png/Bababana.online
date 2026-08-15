import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Language } from "./content";
import { getPackTranslation, getUiTranslation } from "./books.functions";
import { hasNativeDict, setUiOverlay } from "./i18n";

const CACHE_PREFIX = "ysk:tr:v1:";

function readLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota — ignore */
  }
}

/**
 * Fills every UI string for languages we do not hand-write (Spanish today) using the
 * Google Translation API, cached in Cloud and in localStorage so switching is instant next time.
 */
export function useUiTranslation(lang: Language) {
  const fetchUi = useServerFn(getUiTranslation);
  const [, force] = useState(0);
  const needs = lang !== "en" && !hasNativeDict(lang);

  useEffect(() => {
    if (!needs) return;
    const cached = readLocal<Record<string, string>>(`ui:${lang}`);
    if (cached) {
      setUiOverlay(lang, cached);
      force((n) => n + 1);
    }
  }, [lang, needs]);

  const { data } = useQuery({
    queryKey: ["ui-translation", lang],
    enabled: needs,
    staleTime: Infinity,
    queryFn: () => fetchUi({ data: { lang } }),
  });

  useEffect(() => {
    if (!data) return;
    setUiOverlay(lang, data);
    writeLocal(`ui:${lang}`, data);
    force((n) => n + 1);
  }, [data, lang]);
}

/**
 * Returns a content pack in the user's language. Hand-written packs are used as-is;
 * anything else is translated once through Google Translate and cached.
 */
export function useTranslatedPack<T>(id: string, source: T, lang: Language, native: boolean): T {
  const fetchPack = useServerFn(getPackTranslation);
  const needs = lang !== "en" && !native;
  const [local, setLocal] = useState<T | null>(null);

  useEffect(() => {
    if (!needs) return;
    setLocal(readLocal<T>(`pack:${id}:${lang}`));
  }, [id, lang, needs]);

  const { data } = useQuery({
    queryKey: ["pack-translation", id, lang],
    enabled: needs,
    staleTime: Infinity,
    queryFn: () => fetchPack({ data: { id, lang, source: source as unknown } }),
  });

  useEffect(() => {
    if (!data) return;
    writeLocal(`pack:${id}:${lang}`, data);
    setLocal(data as T);
  }, [data, id, lang]);

  if (!needs) return source;
  return (local ?? source) as T;
}
