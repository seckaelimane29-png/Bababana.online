import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Lock } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { useLocalizedBooks } from "@/lib/library";
import { BookArt } from "@/components/BookArt";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/app/books/")({
  head: () => ({
    meta: [
      { title: "Books — Yesal Sa Khel" },
      { name: "description", content: "31 timeless books distilled into 5 key insights each, in a wise-friend voice for the African diaspora." },
      { property: "og:title", content: "Books — Yesal Sa Khel" },
      { property: "og:description", content: "31 timeless books distilled into 5 key insights each." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BooksList,
});

function BooksList() {
  const { profile } = useProfile();
  const lang = profile.language;
  const { books, categories: cats, categoryLabel, isLoading } = useLocalizedBooks(lang);
  const [cat, setCat] = useState<string>("All");

  const categories = ["All", ...cats];
  const list = books.filter((b) => cat === "All" || b.category === cat);

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="mb-5">
        <div className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">{t(lang, "books.kicker")}</div>
        <h1 className="font-display text-3xl font-bold">{t(lang, "books.title")}</h1>
      </div>

      <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${cat === c ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
          >
            {c === "All" ? t(lang, "books.all") : categoryLabel(c)}
          </button>
        ))}
      </div>

      {isLoading && <div className="py-16 text-center text-sm text-muted-foreground">…</div>}

      <div className="grid grid-cols-1 gap-3">
        {list.map((b) => (
          <Link
            key={b.id}
            to="/app/read/$id"
            params={{ id: b.id }}
            className="flex gap-4 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/50"
          >
            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg shadow-elevated ring-1 ring-black/20">
              <BookArt title={b.title} author={b.author ?? undefined} />
            </div>
            <div className="flex flex-1 flex-col justify-between py-1">
              <div>
                <div className="font-display text-base font-semibold leading-tight">{b.title}</div>
                <div className="text-xs text-muted-foreground">{b.author}</div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {b.read_minutes} {t(lang, "books.min")}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-primary">
                  <Lock className="h-3 w-3" /> Insight 1 free
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
