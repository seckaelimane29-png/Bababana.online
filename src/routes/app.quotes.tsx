import { createFileRoute } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { useLocalizedQuotes } from "@/lib/library";
import { WisdomTabs } from "./app.proverbs";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/app/quotes")({
  head: () => ({
    meta: [
      { title: "Quotes — Yesal Sa Khel" },
      { name: "description", content: "18 African quotes from proverbs, philosophers and leaders — Mandela, Tutu, Baldwin, Mbiti and more." },
      { property: "og:title", content: "Quotes — Yesal Sa Khel" },
      { property: "og:description", content: "African quotes from proverbs, philosophers and leaders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuotesScreen,
});

function QuotesScreen() {
  const { profile } = useProfile();
  const { quotes, isLoading } = useLocalizedQuotes(profile.language);

  async function share(text: string, author: string | null) {
    const line = `"${text}" — ${author ?? ""} · via Yesal Sa Khel`;
    if (navigator.share) await navigator.share({ text: line });
    else await navigator.clipboard.writeText(line);
  }

  return (
    <div className="px-5 pt-6 pb-8">
      <WisdomTabs />
      <div className="mb-5">
        <div className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">Voices</div>
        <h1 className="font-display text-2xl font-bold">Quotes</h1>
      </div>

      {isLoading && <div className="py-16 text-center text-sm text-muted-foreground">…</div>}

      <div className="space-y-4">
        {quotes.map((q) => (
          <article
            key={q.id}
            className={`relative overflow-hidden rounded-3xl border p-6 ${q.is_featured ? "border-[color:var(--gold)]/50 bg-hero" : "border-border bg-card"}`}
          >
            {q.is_featured && <div className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)]">Featured</div>}
            <p className="font-display text-xl leading-snug">"{q.text}"</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                <div className="text-foreground/80">{q.author}</div>
                <div>{q.flag} {q.region}</div>
              </div>
              <button
                onClick={() => share(q.text, q.author)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground"
                aria-label="Share quote"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
