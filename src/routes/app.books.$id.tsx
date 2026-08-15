import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BOOKS, amazonSearchUrl } from "@/lib/content";
import { BookCover } from "@/components/BookCover";
import { BookQuiz } from "@/components/BookQuiz";
import { useProfile } from "@/lib/profile";
import { t, isRtl } from "@/lib/i18n";
import { useLocalizedBook } from "@/lib/useLocalizedBook";
import { ArrowLeft, Bookmark, Check, Clock, ExternalLink, Share2 } from "lucide-react";

export const Route = createFileRoute("/app/books/$id")({
  component: BookDetail,
});

function BookDetail() {
  const { id } = useParams({ from: "/app/books/$id" });
  const source = useMemo(() => BOOKS.find((b) => b.id === id), [id]);
  const { profile, toggleBookmark, markRead } = useProfile();
  const lang = profile.language;
  const { book, translating, pack, labels } = useLocalizedBook(source, lang);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScroll(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (scroll > 70 && book && !profile.readToday.includes(book.id)) {
      markRead(book.id);
    }
  }, [scroll, book, profile.readToday, markRead]);

  if (!book) {
    return <div className="p-8 text-center text-muted-foreground">{t(lang, "book.notFound")}</div>;
  }
  const saved = profile.bookmarks.includes(book.id);

  async function onShare() {
    if (!book) return;
    const text = `"${book.quote}" — ${book.author} · via Yesal Sa Khel`;
    if (navigator.share) await navigator.share({ title: book.title, text });
    else await navigator.clipboard.writeText(text);
  }

  return (
    <div dir={isRtl(lang) ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-30 h-1 bg-secondary">
        <div className="h-full bg-gradient-green transition-all" style={{ width: `${scroll}%` }} />
      </div>
      <div className="px-5 pt-4 pb-24">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/app/books" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> {t(lang, "nav.books")}</Link>
          <div className="flex gap-2">
            <button onClick={() => toggleBookmark(book.id)} className={`grid h-9 w-9 place-items-center rounded-full border ${saved ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`} aria-label="Save"><Bookmark className={`h-4 w-4 ${saved ? "fill-primary" : ""}`} /></button>
            <button onClick={onShare} className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground" aria-label="Share"><Share2 className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <BookCover title={book.title} author={book.author} hue={book.hue} size="lg" />
          <div className="flex-1 pb-1">
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--gold)]">{t(lang, "book.summary")}</div>
            <h1 className="font-display text-2xl font-bold leading-tight">{book.title}</h1>
            <div className="mt-1 text-sm text-muted-foreground">{book.author}</div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {book.minutes} {t(lang, "book.minutes")}
            </div>
          </div>
        </div>

        <p className="mt-6 font-display text-xl font-semibold leading-snug text-foreground">
          {book.tagline}
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4">
          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span>{t(lang, "book.progress")}</span>
            <span className="text-[color:var(--gold)]">{Math.round(scroll)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-gradient-green transition-all duration-300" style={{ width: `${scroll}%` }} />
          </div>
        </div>

        {translating && (
          <p className="mt-6 rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">{t(lang, "book.translating")}</p>
        )}

        <p className="mt-6 text-base leading-relaxed text-foreground/85">{book.insight}</p>

        <Section title={t(lang, "book.insights")}>
          <ul className="space-y-3">
            {book.keyInsights.map((k, i) => (
              <li key={i} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">{i + 1}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold)]">{t(lang, "book.insight")} {i + 1}/5</div>
                </div>
                <InsightBody text={k} />
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t(lang, "book.actions")}>
          <ul className="space-y-2">
            {book.actionSteps.map((a, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-[color:var(--gold)]/30 bg-card p-4">
                <Check className="h-5 w-5 shrink-0 text-[color:var(--gold)]" />
                <div className="text-sm">{a}</div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t(lang, "book.remember")}>
          <blockquote className="rounded-2xl bg-hero p-6 font-display text-xl leading-snug shadow-elevated">"{book.quote}"</blockquote>
        </Section>

        <Section title={t(lang, "book.quizTitle")}>
          <BookQuiz book={book} pack={pack} labels={labels} />
        </Section>

        <Section title={t(lang, "book.full")}>
          <a
            href={amazonSearchUrl(book)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-green px-6 py-4 font-semibold text-primary-foreground shadow-glow transition active:scale-[0.98]"
          >
            {t(lang, "book.fullCta")} <ExternalLink className="h-4 w-4" />
          </a>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">{t(lang, "book.amazon")}</p>
        </Section>
      </div>
    </div>
  );
}

function InsightBody({ text }: { text: string }) {
  // Bold **word** and split paragraphs on "\n\n"
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
      {paragraphs.map((p, i) => (
        <p key={i}>
          {p.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
            if (chunk.startsWith("**") && chunk.endsWith("**")) {
              return <strong key={j} className="font-display text-base font-bold text-foreground">{chunk.slice(2, -2)}</strong>;
            }
            return <span key={j}>{chunk}</span>;
          })}
        </p>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">{title}</div>
      {children}
    </section>
  );
}