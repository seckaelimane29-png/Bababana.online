import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { BOOKS, quizPack } from "./content";
import type { TranslatedBook } from "./books.functions";
import { gtranslateDeep } from "./gtranslate.server";

async function readCache<T>(id: string, lang: string): Promise<T | null> {
  const { data } = await supabaseAdmin
    .from("book_translations")
    .select("payload")
    .eq("book_id", id)
    .eq("lang", lang)
    .maybeSingle();
  return (data?.payload as T) ?? null;
}

async function writeCache(id: string, lang: string, payload: unknown) {
  const { error } = await supabaseAdmin
    .from("book_translations")
    .upsert({ book_id: id, lang, payload: JSON.parse(JSON.stringify(payload)) }, { onConflict: "book_id,lang" });
  if (error) console.error("[translate] cache write failed", error);
}

export async function translateBook(bookId: string, lang: string): Promise<TranslatedBook | null> {
  const book = BOOKS.find((b) => b.id === bookId);
  if (!book) return null;

  const cached = await readCache<TranslatedBook>(bookId, lang);
  if (cached) return cached;

  const source: TranslatedBook = {
    tagline: book.tagline,
    insight: book.insight,
    keyInsights: book.keyInsights,
    actionSteps: book.actionSteps,
    quote: book.quote,
    quiz: quizPack(book),
    labels: {
      ideaQ: `Which of these is a core idea from ${book.title}?`,
      ideaWhy: "This is one of the five key insights in this summary.",
      stepQ: "Which action step does this summary ask you to take?",
      stepWhy: "This is the first of the three action steps above.",
      quoteQ: `Which line is the quote to remember from ${book.title}?`,
      quoteWhy: `This is the "Remember this" quote from ${book.author}.`,
      authoredWhy: `${book.author} makes this the backbone of ${book.title}.`,
    },
  };

  const payload = await gtranslateDeep(JSON.parse(JSON.stringify(source)) as never, lang) as TranslatedBook | null;
  if (!payload?.keyInsights?.length) return null;

  await writeCache(bookId, lang, payload);
  return payload;
}

export type TranslatedWisdom = {
  proverbs: { text: string; origin: string }[];
  stories: { name: string; origin: string; now: string; built: string; lesson: string }[];
};

/** Translates the proverbs + diaspora stories once per language and caches them in Cloud. */
export async function translateWisdom(lang: string): Promise<TranslatedWisdom | null> {
  const { PROVERBS, STORIES } = await import("./content");

  const cached = await readCache<TranslatedWisdom>("__wisdom", lang);
  if (cached) return cached;

  const source: TranslatedWisdom = {
    proverbs: PROVERBS.map((p) => ({ text: p.text, origin: p.origin })),
    stories: STORIES.map((s) => ({ name: s.name, origin: s.origin, now: s.now, built: s.built, lesson: s.lesson })),
  };

  const payload = (await gtranslateDeep(JSON.parse(JSON.stringify(source)) as never, lang)) as TranslatedWisdom | null;
  if (payload?.proverbs?.length !== source.proverbs.length || payload?.stories?.length !== source.stories.length) return null;

  await writeCache("__wisdom", lang, payload);
  return payload;
}

/** Translates the whole English UI dictionary once per language, cached in Cloud. */
export async function translateUi(lang: string): Promise<Record<string, string> | null> {
  const cacheId = "__ui";
  const cached = await readCache<Record<string, string>>(cacheId, lang);
  if (cached) return cached;

  const { englishDict } = await import("./i18n");
  const payload = (await gtranslateDeep(englishDict() as never, lang)) as Record<string, string> | null;
  if (!payload) return null;

  await writeCache(cacheId, lang, payload);
  return payload;
}

/** Translates an arbitrary JSON content pack, cached per id + language. */
export async function translatePack(id: string, lang: string, source: unknown): Promise<unknown | null> {
  const cacheId = `__pack:${id}`;
  const cached = await readCache<unknown>(cacheId, lang);
  if (cached) return cached;

  const payload = await gtranslateDeep(JSON.parse(JSON.stringify(source)) as never, lang);
  if (!payload) return null;

  await writeCache(cacheId, lang, payload);
  return payload;
}
