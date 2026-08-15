import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Book, Language } from "./content";
import { getBookTranslation } from "./books.functions";

/** Returns the book in the user's language — English source, or an AI translation cached in Cloud. */
export function useLocalizedBook(book: Book | undefined, lang: Language) {
  const fetchTranslation = useServerFn(getBookTranslation);

  const enabled = Boolean(book) && lang !== "en";
  const { data, isLoading } = useQuery({
    queryKey: ["book-translation", book?.id, lang],
    enabled,
    staleTime: Infinity,
    queryFn: () => fetchTranslation({ data: { bookId: book!.id, lang } }),
  });

  if (!book) return { book: undefined, translating: false, pack: undefined, labels: undefined };
  if (!enabled) return { book, translating: false, pack: undefined, labels: undefined };
  if (!data) return { book, translating: isLoading, pack: undefined, labels: undefined };

  return {
    book: {
      ...book,
      tagline: data.tagline ?? book.tagline,
      insight: data.insight ?? book.insight,
      keyInsights: data.keyInsights?.length === book.keyInsights.length ? data.keyInsights : book.keyInsights,
      actionSteps: data.actionSteps?.length === book.actionSteps.length ? data.actionSteps : book.actionSteps,
      quote: data.quote ?? book.quote,
    } satisfies Book,
    translating: false,
    pack: data.quiz,
    labels: data.labels,
  };
}
