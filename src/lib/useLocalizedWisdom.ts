import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PROVERBS, STORIES, type Language } from "./content";
import { getWisdomTranslation } from "./books.functions";

/** Proverbs and stories in the user's language — English source, or a cached AI translation. */
export function useLocalizedWisdom(lang: Language) {
  const fetchWisdom = useServerFn(getWisdomTranslation);
  const enabled = lang !== "en";

  const { data, isLoading } = useQuery({
    queryKey: ["wisdom-translation", lang],
    enabled,
    staleTime: Infinity,
    queryFn: () => fetchWisdom({ data: { lang } }),
  });

  if (!enabled || !data) {
    return { proverbs: PROVERBS, stories: STORIES, translating: enabled && isLoading };
  }

  return {
    proverbs: PROVERBS.map((p, i) => ({ ...p, text: data.proverbs[i]?.text ?? p.text, origin: data.proverbs[i]?.origin ?? p.origin })),
    stories: STORIES.map((s, i) => ({ ...s, ...(data.stories[i] ?? {}) })),
    translating: false,
  };
}
