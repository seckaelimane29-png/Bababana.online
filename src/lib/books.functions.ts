import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LANG = z.enum(["en", "fr", "it", "es", "ar", "pt"]);

const Input = z.object({
  bookId: z.string().min(1),
  lang: LANG,
});

export type TranslatedBook = {
  tagline: string;
  insight: string;
  keyInsights: string[];
  actionSteps: string[];
  quote: string;
  quiz?: {
    authored: { q: string; options: string[]; answer: number }[];
    ideaWrong: string[];
    stepWrong: string[];
    quoteWrong: string[];
  };
  labels?: {
    ideaQ: string;
    ideaWhy: string;
    stepQ: string;
    stepWhy: string;
    quoteQ: string;
    quoteWhy: string;
    authoredWhy: string;
  };
};

/** Returns a cached translation of a book summary, generating it once per language. */
export const getBookTranslation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<TranslatedBook | null> => {
    if (data.lang === "en") return null;

    const { translateBook } = await import("./translate.server");
    return translateBook(data.bookId, data.lang);
  });

const WisdomInput = z.object({ lang: LANG });

export type TranslatedWisdomPayload = {
  proverbs: { text: string; origin: string }[];
  stories: { name: string; origin: string; now: string; built: string; lesson: string }[];
};

/** Returns proverbs and diaspora stories in the user's language, cached after the first request. */
export const getWisdomTranslation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => WisdomInput.parse(d))
  .handler(async ({ data }): Promise<TranslatedWisdomPayload | null> => {
    if (data.lang === "en") return null;
    const { translateWisdom } = await import("./translate.server");
    return translateWisdom(data.lang);
  });

const UiInput = z.object({ lang: LANG });

/** Google-translated UI dictionary for a language we do not hand-write, cached in Cloud. */
export const getUiTranslation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => UiInput.parse(d))
  .handler(async ({ data }): Promise<Record<string, string> | null> => {
    if (data.lang === "en") return null;
    const { translateUi } = await import("./translate.server");
    return translateUi(data.lang);
  });

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

const PackInput = z.object({
  id: z.string().min(1).max(64),
  lang: LANG,
  source: z.any(),
});

/** Generic JSON pack translation (quiz copy, coach copy, story visuals), cached per id + language. */
export const getPackTranslation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PackInput.parse(d))
  .handler(async ({ data }): Promise<JsonValue | null> => {
    if (data.lang === "en") return null;
    const { translatePack } = await import("./translate.server");
    return (await translatePack(data.id, data.lang, data.source)) as JsonValue | null;
  });
