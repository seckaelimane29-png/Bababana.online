import { BookArt } from "@/components/BookArt";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bookmark, Clock, ExternalLink, Flame, Lock, Share2 } from "lucide-react";
import { ChallengeWisdom } from "@/components/ChallengeWisdom";
import { useProfile } from "@/lib/profile";
import { amazonUrl, useLocalizedDbBook } from "@/lib/library";
import { isRtl, t } from "@/lib/i18n";
import { useSubscription } from "@/lib/subscription";
import { UnlockPrompt } from "@/components/UnlockPrompt";

export const Route = createFileRoute("/app/read/$id")({
  head: () => ({
    meta: [
      { title: "Read — Yesal Sa Khel" },
      { name: "description", content: "Five key insights from a timeless book, told in a wise-friend voice with Wolof wisdom." },
      { property: "og:title", content: "Read — Yesal Sa Khel" },
      { property: "og:description", content: "Five key insights, told in a wise-friend voice with Wolof wisdom." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reader,
});

function Reader() {
  const { id } = Route.useParams();
  const { profile, toggleBookmark } = useProfile();
  const lang = profile.language;
  const { book, insights, isLoading, translating } = useLocalizedDbBook(id, lang);
  const [challenge, setChallenge] = useState(false);
  const saved = profile.bookmarks.includes(id);
  const { isPremium } = useSubscription();
  const [prompt, setPrompt] = useState(false);

  if (isLoading) return <div className="px-5 py-24 text-center text-sm text-muted-foreground">…</div>;
  if (!book) return <div className="px-5 py-24 text-center text-sm text-muted-foreground">{t(lang, "read.notFound")}</div>;

  const b = book;
  const locked = !isPremium;
  const visible = locked ? insights.slice(0, 1) : insights;
  const blurred = locked ? insights.slice(1) : [];

  async function share() {
    const text = `${b.title} — ${b.author} · via Yesal Sa Khel`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* sharing blocked in this context — fall back to the clipboard */
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="pb-10" dir={isRtl(lang) ? "rtl" : "ltr"}>
      <div
        className="px-5 pb-8 pt-6"
        style={{ background: `linear-gradient(170deg, ${b.color_to ?? "#1a3a1a"}, ${b.color_from ?? "#060b07"} 70%, #060b07)` }}
      >
        <Link to="/app/books" className="mb-6 inline-flex items-center gap-2 text-xs text-white/70">
          <ArrowLeft className="h-4 w-4" /> {t(lang, "read.back")}
        </Link>
        <div className="relative h-28 w-20 overflow-hidden rounded-lg shadow-elevated ring-1 ring-black/20">
          <BookArt title={b.title} author={b.author ?? undefined} />
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white">{b.title}</h1>
        <div className="text-sm text-white/70">{b.author}</div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-white/70">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1"><Clock className="h-3 w-3" /> {b.read_minutes} {t(lang, "read.min")}</span>
          <span className="rounded-full bg-black/30 px-3 py-1">{b.categoryLabel}</span>
          {locked && <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-[color:var(--gold)]"><Lock className="h-3 w-3" /> Insight 1 free</span>}
        </div>
      </div>

      <div className="space-y-4 px-5 pt-6">
        {translating && (
          <div className="rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
            {t(lang, "read.translating")}
          </div>
        )}
        {insights.length > 0 && (
          <nav className="rounded-2xl border border-border bg-card p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">{t(lang, "read.toc")}</div>
            <ol className="mt-4 space-y-3">
              {insights.map((ins, i) => {
                const hidden = locked && i > 0;
                return (
                  <li key={ins.id} className="flex gap-3 text-sm">
                    <span className="font-display font-bold text-[color:var(--gold)]">{String(ins.insight_order).padStart(2, "0")}</span>
                    {hidden ? (
                      <button onClick={() => setPrompt(true)} className="inline-flex items-center gap-1 text-left text-muted-foreground">
                        <Lock className="h-3 w-3" /> {ins.title}
                      </button>
                    ) : (
                      <a href={`#insight-${ins.insight_order}`} className="text-foreground/85">{ins.title}</a>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {visible.map((ins) => (
          <article key={ins.id} id={`insight-${ins.insight_order}`} className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 scroll-mt-4">
            <span className="pointer-events-none absolute -top-4 right-3 select-none font-display text-8xl font-black leading-none text-foreground/5">
              {ins.insight_order}
            </span>
            <div className="relative">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">
                {t(lang, "read.insight")} {String(ins.insight_order).padStart(2, "0")} {t(lang, "read.of")} {String(insights.length).padStart(2, "0")}
              </div>
              <h2 className="mt-2 font-display text-xl font-bold leading-snug">{ins.title}</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">{ins.body}</p>
              {ins.wolof_wisdom && (
                <div className="mt-4 rounded-xl border-l-2 border-[color:var(--gold)] bg-background/60 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">{t(lang, "read.wisdom")}</div>
                  <p className="mt-2 font-display text-sm">{ins.wolof_wisdom}</p>
                </div>
              )}
            </div>
          </article>
        ))}

        {!locked && insights.length > 1 && (
          <button
            onClick={() => setChallenge(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-green px-6 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-glow active:scale-[0.98]"
          >
            <Flame className="h-4 w-4" /> {t(lang, "read.challenge")}
          </button>
        )}

        {locked && blurred.length > 0 && (
          <div className="relative">
            <div className="space-y-4 select-none blur-[6px] saturate-50" aria-hidden>
              {blurred.map((ins) => (
                <article key={ins.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">
                    {t(lang, "read.insight")} {String(ins.insight_order).padStart(2, "0")}
                  </div>
                  <h2 className="mt-2 font-display text-xl font-bold leading-snug">{ins.title}</h2>
                  <p className="mt-3 line-clamp-6 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">{ins.body}</p>
                </article>
              ))}
            </div>
            <button
              onClick={() => setPrompt(true)}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-background/35 text-center"
              aria-label="Unlock with free trial"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full" style={{ background: "var(--gold)", color: "var(--navy)" }}>
                <Lock className="h-5 w-5" />
              </span>
              <span className="font-display text-sm font-bold" style={{ color: "var(--gold)" }}>Unlock with free trial</span>
            </button>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <a
            href={amazonUrl(b.title, b.author)}
            target="_blank"
            rel="noreferrer noopener"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-green px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            {t(lang, "read.getFull")} <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={() => toggleBookmark(b.id)}
            className={`grid h-12 w-12 place-items-center rounded-full border ${saved ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
            aria-label="Bookmark"
          >
            <Bookmark className={`h-5 w-5 ${saved ? "fill-primary" : ""}`} />
          </button>
          <button onClick={share} className="grid h-12 w-12 place-items-center rounded-full border border-border text-muted-foreground" aria-label="Share">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {challenge && (
        <ChallengeWisdom title={b.title} author={b.author ?? "the author"} insights={insights} onClose={() => setChallenge(false)} />
      )}

      {prompt && <UnlockPrompt bookTitle={b.title} insightCount={insights.length || 5} onClose={() => setPrompt(false)} />}
    </div>
  );
}
