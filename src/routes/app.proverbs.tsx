import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useProfile } from "@/lib/profile";
import { useLocalizedProverbs } from "@/lib/library";
import { LANGUAGES, type Language } from "@/lib/content";
import { isRtl } from "@/lib/i18n";
import { useSubscription, useDailyLimit } from "@/lib/subscription";
import { Paywall } from "@/components/Paywall";

export const Route = createFileRoute("/app/proverbs")({
  head: () => ({
    meta: [
      { title: "Proverbs — Yesal Sa Khel" },
      { name: "description", content: "Authentic Wolof proverbs with translations in English, French, Italian and Spanish, explained for diaspora life." },
      { property: "og:title", content: "Proverbs — Yesal Sa Khel" },
      { property: "og:description", content: "Wolof proverbs, translated and explained for diaspora life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProverbsScreen,
});

function ProverbsScreen() {
  const { profile, update } = useProfile();
  const { proverbs, isLoading } = useLocalizedProverbs(profile.language);
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<string | null>(null);
  const { isPremium } = useSubscription();
  const { allow, used, limit } = useDailyLimit("proverb", isPremium);
  const [blocked, setBlocked] = useState(false);

  const cats = ["All", ...Array.from(new Set(proverbs.map((p) => p.category).filter(Boolean) as string[]))];
  const list = proverbs.filter((p) => cat === "All" || p.category === cat);

  return (
    <div className="px-5 pt-6 pb-8" dir={isRtl(profile.language) ? "rtl" : "ltr"}>
      <WisdomTabs />

      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">Wolof</div>
          <h1 className="font-display text-2xl font-bold">Proverbs</h1>
        </div>
        <select
          value={profile.language}
          onChange={(e) => update({ language: e.target.value as Language })}
          className="rounded-full border border-border bg-card px-3 py-2 text-xs text-foreground"
          aria-label="Language"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
          ))}
        </select>
      </div>

      <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${cat === c ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && <div className="py-16 text-center text-sm text-muted-foreground">…</div>}

      {!isPremium && (
        <div className="mb-4 text-[11px] uppercase tracking-widest text-muted-foreground">
          Free plan · {Math.min(used, limit)}/{limit} proverbs opened today
        </div>
      )}

      {blocked && (
        <div className="mb-4">
          <Paywall title="Daily free limit reached" message="Free readers open 3 proverbs a day. Renew your subscription for unlimited wisdom." />
        </div>
      )}

      <div className="space-y-3">
        {list.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              if (open === p.id) {
                setOpen(null);
                return;
              }
              if (!allow(p.id)) {
                setBlocked(true);
                return;
              }
              setBlocked(false);
              setOpen(p.id);
            }}
            className="w-full rounded-2xl border border-border bg-card p-5 text-left transition hover:border-primary/50"
          >
            <div className="font-display text-xl font-bold leading-snug">{p.wolof}</div>
            <div className="mt-2 text-sm text-foreground/80">{p.text}</div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{p.flag}</span>
              <span>{p.origin}</span>
              <span className="rounded-full border border-border px-2 py-0.5">{p.category}</span>
            </div>
            {open === p.id && p.explanationText && (
              <p className="mt-4 border-t border-border pt-4 text-[15px] leading-relaxed text-foreground/85">{p.explanationText}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WisdomTabs() {
  const items = [
    { to: "/app/wisdom" as const, label: "Daily" },
    { to: "/app/proverbs" as const, label: "Proverbs" },
    { to: "/app/quotes" as const, label: "Quotes" },
  ];
  return (
    <div className="mb-5 grid grid-cols-3 gap-1 rounded-full border border-border bg-card p-1">
      {items.map((i) => (
        <Link
          key={i.to}
          to={i.to}
          activeProps={{ className: "bg-primary/15 text-primary" }}
          className="rounded-full py-2 text-center text-xs text-muted-foreground transition"
        >
          {i.label}
        </Link>
      ))}
    </div>
  );
}
