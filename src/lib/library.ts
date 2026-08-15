import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Language } from "./content";
import { useTranslatedPack } from "./useAutoTranslate";

export type DbBook = {
  id: string;
  title: string;
  author: string | null;
  category: string | null;
  emoji: string | null;
  color_from: string | null;
  color_to: string | null;
  read_minutes: number | null;
  is_free: boolean;
};

export type DbInsight = {
  id: number;
  book_id: string;
  insight_order: number;
  title: string | null;
  body: string | null;
  wolof_wisdom: string | null;
};

export type DbProverb = {
  id: string;
  wolof: string | null;
  translation: string | null;
  category: string | null;
  origin: string | null;
  flag: string | null;
  en_translation: string | null;
  fr_translation: string | null;
  it_translation: string | null;
  es_translation: string | null;
  explanation: string | null;
};

export type DbQuote = {
  id: string;
  text: string;
  author: string | null;
  region: string | null;
  flag: string | null;
  is_featured: boolean;
};

/** All books in the Cloud library, free titles first. */
export function useBooks() {
  return useQuery({
    queryKey: ["db-books"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<DbBook[]> => {
      const { data, error } = await supabase
        .from("books")
        .select("id,title,author,category,emoji,color_from,color_to,read_minutes,is_free")
        .order("id");
      if (error) throw error;
      return (data ?? []) as DbBook[];
    },
  });
}

/** One book plus its ordered insights. */
export function useBook(id: string) {
  return useQuery({
    queryKey: ["db-book", id],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<{ book: DbBook | null; insights: DbInsight[] }> => {
      const [b, i] = await Promise.all([
        supabase.from("books").select("*").eq("id", id).maybeSingle(),
        supabase.from("book_insights").select("*").eq("book_id", id).order("insight_order"),
      ]);
      if (b.error) throw b.error;
      if (i.error) throw i.error;
      return { book: (b.data as DbBook | null) ?? null, insights: (i.data ?? []) as DbInsight[] };
    },
  });
}

/** Every proverb in the library. */
export function useProverbs() {
  return useQuery({
    queryKey: ["db-proverbs"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<DbProverb[]> => {
      const { data, error } = await supabase.from("proverbs").select("*").order("id");
      if (error) throw error;
      return (data ?? []) as DbProverb[];
    },
  });
}

/** Every quote, featured ones first. */
export function useQuotes() {
  return useQuery({
    queryKey: ["db-quotes"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<DbQuote[]> => {
      const { data, error } = await supabase.from("quotes").select("*").order("is_featured", { ascending: false }).order("id");
      if (error) throw error;
      return (data ?? []) as DbQuote[];
    },
  });
}

/** Picks the proverb translation matching the reader's language, falling back to English. */
export function proverbText(p: DbProverb, lang: Language): string {
  const map: Record<string, string | null | undefined> = {
    en: p.en_translation,
    fr: p.fr_translation,
    it: p.it_translation,
    es: p.es_translation,
  };
  return map[lang] || p.en_translation || p.translation || "";
}

/** Languages that already have a stored proverb column. */
const PROVERB_COLUMNS = ["en", "fr", "it", "es"];

/** Proverbs in the reader's language — stored columns, or Google-translated and cached. */
export function useLocalizedProverbs(lang: Language) {
  const { data, isLoading } = useProverbs();
  const rows = useMemo(() => data ?? [], [data]);

  const source = useMemo(
    () => rows.map((p) => ({ text: proverbText(p, "en"), explanation: p.explanation ?? "" })),
    [rows],
  );
  const native = PROVERB_COLUMNS.includes(lang) || rows.length === 0;
  const translated = useTranslatedPack("proverbs-v1", source, lang, native);

  const proverbs = useMemo(
    () =>
      rows.map((p, i) => ({
        ...p,
        text: native ? proverbText(p, lang) : (translated[i]?.text ?? proverbText(p, "en")),
        explanationText: native ? (p.explanation ?? "") : (translated[i]?.explanation ?? p.explanation ?? ""),
      })),
    [rows, native, lang, translated],
  );

  return { proverbs, isLoading };
}

/** Quotes in the reader's language, translated once and cached. */
export function useLocalizedQuotes(lang: Language) {
  const { data, isLoading } = useQuotes();
  const rows = useMemo(() => data ?? [], [data]);

  const source = useMemo(() => rows.map((q) => ({ text: q.text, author: q.author ?? "" })), [rows]);
  const native = lang === "en" || rows.length === 0;
  const translated = useTranslatedPack("quotes-v1", source, lang, native);

  const quotes = useMemo(
    () => rows.map((q, i) => ({ ...q, text: translated[i]?.text ?? q.text, author: translated[i]?.author ?? q.author })),
    [rows, translated],
  );

  return { quotes, isLoading };
}

export function amazonUrl(title: string, author: string | null) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(`${title} ${author ?? ""}`.trim())}`;
}

/** Book list with category labels in the reader's language, translated once and cached. */
export function useLocalizedBooks(lang: Language) {
  const { data, isLoading } = useBooks();
  const rows = useMemo(() => data ?? [], [data]);

  const cats = useMemo(
    () => Array.from(new Set(rows.map((b) => b.category).filter(Boolean) as string[])),
    [rows],
  );
  const native = lang === "en" || cats.length === 0;
  const translatedCats = useTranslatedPack("book-categories-v1", cats, lang, native);

  const catMap = useMemo(() => {
    const m: Record<string, string> = {};
    cats.forEach((c, i) => (m[c] = translatedCats[i] ?? c));
    return m;
  }, [cats, translatedCats]);

  const books = useMemo(
    () => rows.map((b) => ({ ...b, categoryLabel: b.category ? (catMap[b.category] ?? b.category) : "" })),
    [rows, catMap],
  );

  return { books, categories: cats, categoryLabel: (c: string) => catMap[c] ?? c, isLoading };
}

/** One book with all of its insights rendered in the reader's language. */
export function useLocalizedDbBook(id: string, lang: Language) {
  const { data, isLoading } = useBook(id);
  const book = data?.book ?? null;
  const insights = useMemo(() => data?.insights ?? [], [data]);

  const source = useMemo(
    () => ({
      category: book?.category ?? "",
      insights: insights.map((i) => ({
        title: i.title ?? "",
        body: i.body ?? "",
        wisdom: i.wolof_wisdom ?? "",
      })),
    }),
    [book?.category, insights],
  );

  const native = lang === "en" || !book;
  const translated = useTranslatedPack(`book-${id}-v1`, source, lang, native);
  const translating = !native && translated === source;

  const localized = useMemo(
    () =>
      insights.map((i, idx) => ({
        ...i,
        title: translated.insights?.[idx]?.title || i.title,
        body: translated.insights?.[idx]?.body || i.body,
        wolof_wisdom: translated.insights?.[idx]?.wisdom || i.wolof_wisdom,
      })),
    [insights, translated],
  );

  return {
    book: book ? { ...book, categoryLabel: translated.category || book.category || "" } : null,
    insights: localized,
    isLoading,
    translating,
  };
}
