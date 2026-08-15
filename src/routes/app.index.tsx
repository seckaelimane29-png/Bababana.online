import { createFileRoute, Link } from "@tanstack/react-router";
import { useProfile } from "@/lib/profile";
import { BOOKS } from "@/lib/content";
import { Avatar, BookCover } from "@/components/BookCover";
import { Flame, ArrowRight, Sparkles } from "lucide-react";
import { t, tf } from "@/lib/i18n";
import { useLocalizedWisdom } from "@/lib/useLocalizedWisdom";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Yesal Sa Khel — Home" }, { name: "description", content: "Your daily African wisdom, in one place." }] }),
  component: Home,
});

function Home() {
  const { profile } = useProfile();
  const lang = profile.language;
  const { proverbs } = useLocalizedWisdom(lang);
  const dayIndex = Math.floor(Date.now() / 86400000) % proverbs.length;
  const proverb = proverbs[dayIndex];
  const nextBook = BOOKS.find((b) => !profile.readToday.includes(b.id)) ?? BOOKS[0];
  const goalPct = Math.min(100, Math.round((profile.readToday.length / 3) * 100));

  return (
    <div className="space-y-6 px-5 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t(lang, "ui.welcome")}</div>
          <div className="font-display text-2xl font-bold">{profile.name}</div>
        </div>
        <Link to="/app/profile"><Avatar emoji={profile.avatar} size={44} /></Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[color:var(--gold)]" />
            <span className="font-display text-lg font-bold">{profile.streak} {t(lang, "home.streak")}</span>
          </div>
          <div className="text-xs text-muted-foreground">{tf(lang, "ui.todayCount", { n: profile.readToday.length })}</div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-gradient-green transition-all" style={{ width: `${goalPct}%` }} />
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          {profile.streak < 7 ? tf(lang, "ui.ms1", { n: 7 - profile.streak }) : profile.streak < 30 ? tf(lang, "ui.ms2", { n: 30 - profile.streak }) : t(lang, "ui.ms3")}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Link to="/app/books/$id" params={{ id: nextBook.id }} className="group flex items-center gap-4 rounded-2xl bg-gradient-green p-5 shadow-glow transition hover:brightness-110">
          <BookCover title={nextBook.title} author={nextBook.author} hue={nextBook.hue} size="sm" />
          <div className="flex-1 text-primary-foreground">
            <div className="text-[11px] uppercase tracking-[0.2em] opacity-80">{t(lang, "ui.continue")}</div>
            <div className="font-display text-lg font-bold leading-tight">{t(lang, "home.continue")}</div>
            <div className="mt-1 text-xs opacity-80">{nextBook.title}</div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary-foreground" />
        </Link>
        <Link to="/app/wisdom" className="flex items-center gap-4 rounded-2xl bg-gradient-gold p-5 transition hover:brightness-110">
          <div className="grid h-14 w-14 place-items-center rounded-xl bg-[color:var(--gold-foreground)]/10"><Sparkles className="h-6 w-6 text-[color:var(--gold-foreground)]" /></div>
          <div className="flex-1 text-[color:var(--gold-foreground)]">
            <div className="text-[11px] uppercase tracking-[0.2em] opacity-80">{t(lang, "ui.today")}</div>
            <div className="font-display text-lg font-bold leading-tight">{t(lang, "home.explore")}</div>
            <div className="mt-1 text-xs opacity-80">{t(lang, "ui.wisdomSub")}</div>
          </div>
          <ArrowRight className="h-5 w-5 text-[color:var(--gold-foreground)]" />
        </Link>
      </div>

      <div className="rounded-2xl border border-[color:var(--gold)]/30 bg-hero p-5">
        <div className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">{t(lang, "home.today")}</div>
        <p className="mt-2 font-display text-xl leading-snug">"{proverb.text}"</p>
        <div className="mt-3 text-xs text-muted-foreground">— {proverb.origin}{proverb.original ? ` · ${proverb.original}` : ""}</div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-lg font-bold">{t(lang, "ui.recommended")}</div>
          <Link to="/app/books" className="text-xs text-muted-foreground">{t(lang, "ui.seeAll")}</Link>
        </div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {BOOKS.slice(0, 6).map((b) => (
            <Link key={b.id} to="/app/books/$id" params={{ id: b.id }} className="snap-start">
              <BookCover title={b.title} author={b.author} hue={b.hue} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}