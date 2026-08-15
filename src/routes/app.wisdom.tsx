import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/lib/profile";
import { useLocalizedWisdom } from "@/lib/useLocalizedWisdom";
import { t, isRtl } from "@/lib/i18n";
import { Bookmark, Heart, Share2 } from "lucide-react";
import { WisdomTabs } from "./app.proverbs";

export const Route = createFileRoute("/app/wisdom")({
  head: () => ({ meta: [{ title: "Daily Wisdom — Yesal Sa Khel" }, { name: "description", content: "Swipe through African proverbs and diaspora success stories." }] }),
  component: WisdomFeed,
});

type Card =
  | { kind: "proverb"; text: string; origin: string; original?: string }
  | { kind: "story"; name: string; origin: string; now: string; built: string; lesson: string };

function WisdomFeed() {
  const { profile } = useProfile();
  const lang = profile.language;
  const { proverbs, stories, translating } = useLocalizedWisdom(lang);

  const cards: Card[] = useMemo(() => {
    const p: Card[] = proverbs.map((x) => ({ kind: "proverb", ...x }));
    const s: Card[] = stories.map((x) => ({ kind: "story", ...x }));
    const out: Card[] = [];
    const max = Math.max(p.length, s.length);
    for (let i = 0; i < max; i++) { if (p[i]) out.push(p[i]); if (s[i]) out.push(s[i]); }
    return out;
  }, [proverbs, stories]);

  const [i, setI] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  useEffect(() => {
    let sy = 0;
    function onStart(e: TouchEvent) { sy = e.touches[0].clientY; }
    function onEnd(e: TouchEvent) {
      const dy = e.changedTouches[0].clientY - sy;
      if (dy < -60 && i < cards.length - 1) setI((v) => v + 1);
      if (dy > 60 && i > 0) setI((v) => v - 1);
    }
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [i, cards.length]);

  function toggleLike() {
    setLiked((prev) => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  }

  async function share(c: Card) {
    const text = c.kind === "proverb" ? `"${c.text}" — ${c.origin} · via Yesal Sa Khel` : `${c.name} (${c.origin}) → ${c.lesson} · via Yesal Sa Khel`;
    if (navigator.share) await navigator.share({ text });
    else await navigator.clipboard.writeText(text);
  }

  const c = cards[i];

  if (translating) {
    return <div className="px-5 py-24 text-center text-sm text-muted-foreground">{t(lang, "wisdom.loading")}</div>;
  }

  return (
    <div className="px-5 pt-6 pb-8" dir={isRtl(lang) ? "rtl" : "ltr"}>
      <WisdomTabs />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">{t(lang, "wisdom.kicker")}</div>
          <h1 className="font-display text-2xl font-bold">{t(lang, "wisdom.title")}</h1>
        </div>
        <div className="text-xs text-muted-foreground">{i + 1} / {cards.length}</div>
      </div>

      <div className="relative min-h-[70vh] overflow-hidden rounded-3xl border border-border bg-hero p-6 shadow-elevated">
        {c.kind === "proverb" ? (
          <div className="flex h-full flex-col justify-between">
            <div className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">{t(lang, "wisdom.proverb")}</div>
            <p className="my-8 font-display text-3xl leading-snug">"{c.text}"</p>
            <div className="text-sm text-muted-foreground">— {c.origin}{c.original ? <><br /><span className="italic">{c.original}</span></> : null}</div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">{t(lang, "wisdom.story")}</div>
            <div className="mt-6 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-green font-display text-lg font-bold text-primary-foreground">{c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
              <div>
                <div className="font-display text-lg font-bold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.origin} → {c.now}</div>
              </div>
            </div>
            <p className="mt-6 text-base text-foreground/90">{c.built}</p>
            <div className="mt-6 rounded-2xl border border-[color:var(--gold)]/30 bg-card p-4 font-display text-base">"{c.lesson}"</div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={toggleLike} className={`grid h-11 w-11 place-items-center rounded-full border ${liked.has(i) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}><Heart className={`h-5 w-5 ${liked.has(i) ? "fill-primary" : ""}`} /></button>
          <button className="grid h-11 w-11 place-items-center rounded-full border border-border text-muted-foreground"><Bookmark className="h-5 w-5" /></button>
          <button onClick={() => share(c)} className="grid h-11 w-11 place-items-center rounded-full border border-border text-muted-foreground"><Share2 className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <button onClick={() => setI((v) => Math.max(0, v - 1))} className="rounded-full border border-border px-4 py-2">↑ {t(lang, "wisdom.prev")}</button>
        <span>{t(lang, "wisdom.swipe")}</span>
        <button onClick={() => setI((v) => Math.min(cards.length - 1, v + 1))} className="rounded-full border border-border px-4 py-2">{t(lang, "wisdom.next")} ↓</button>
      </div>
    </div>
  );
}