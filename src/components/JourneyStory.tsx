import { useEffect, useState } from "react";
import type { JourneyInterstitial } from "@/lib/journeyQuiz";
import type { JourneyVisuals } from "@/lib/journeyVisuals";

function StickyCta({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 px-6 pb-8 pt-14 [background:linear-gradient(to_top,var(--background),transparent)]">
      <button
        onClick={onClick}
        className="pointer-events-auto mx-auto block w-full max-w-md rounded-full bg-gradient-gold px-6 py-5 text-lg font-bold text-[color:var(--gold-foreground)] shadow-elevated transition active:scale-[0.98]"
      >
        {label}
      </button>
    </div>
  );
}

/** Screen 1 — the honest numbers: a glowing ring stat + a two-bar comparison. */
export function StoryStat({
  copy,
  inter,
  onNext,
}: {
  copy: JourneyVisuals["stat"];
  inter: JourneyInterstitial;
  onNext: () => void;
}) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setGrown(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <div className="animate-slide-question mx-auto flex w-full max-w-md flex-col items-center px-6 pb-44 pt-12 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[color:var(--gold)]">{copy.kicker}</p>
        <h1 className="mt-4 font-display text-[1.9rem] font-black leading-[1.12] tracking-tight text-white">{copy.headline}</h1>

        <div className="relative mt-8 grid h-48 w-48 place-items-center">
          <div
            className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-1000"
            style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 68%)", opacity: grown ? 0.35 : 0 }}
          />
          <div className="absolute inset-0 rounded-full border border-white/15" />
          <div className="absolute inset-5 rounded-full border border-[color:var(--gold)]/30" />
          <span
            className="font-display text-[4.2rem] font-black leading-none tracking-tight text-transparent transition-all duration-700"
            style={{
              backgroundImage: "var(--gradient-gold)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              opacity: grown ? 1 : 0,
              transform: grown ? "scale(1)" : "scale(0.86)",
            }}
          >
            {copy.stat}
          </span>
        </div>
        <p className="mt-6 text-lg text-white/85">{copy.statCaption}</p>

        <div className="mt-8 grid w-full grid-cols-2 items-end gap-6">
          {[
            { label: copy.youLabel, value: copy.youValue, h: 26, dim: true },
            { label: copy.themLabel, value: copy.themValue, h: 92, dim: false },
          ].map((b) => (
            <div key={b.label} className="flex flex-col items-center">
              <span className="mb-2 text-sm font-bold text-white">{b.value}</span>
              <div
                className="w-full rounded-t-2xl transition-[height] duration-[900ms] ease-out"
                style={{
                  height: grown ? `${b.h}px` : "6px",
                  background: b.dim
                    ? "linear-gradient(to top, oklch(0.45 0.06 155 / 0.5), oklch(0.6 0.08 155 / 0.35))"
                    : "var(--gradient-primary, linear-gradient(to top, var(--primary), oklch(0.82 0.13 82)))",
                  boxShadow: b.dim ? "none" : "0 0 40px -6px var(--primary)",
                }}
              />
              <span className="mt-3 text-xs font-medium text-white/70">{b.label}</span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-base leading-relaxed text-white/70">{copy.footnote}</p>
      </div>
      <StickyCta label={inter.cta} onClick={onNext} />
    </>
  );
}

/** Screen 2 — the promise: four commitment tiles before the final questions. */
export function StoryCommit({
  copy,
  inter,
  onNext,
}: {
  copy: JourneyVisuals["commit"];
  inter: JourneyInterstitial;
  onNext: () => void;
}) {
  return (
    <>
      <div className="animate-slide-question mx-auto flex w-full max-w-md flex-col px-6 pb-44 pt-14 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[color:var(--gold)]">{inter.kicker}</p>
        <h1 className="mt-4 font-display text-[2.2rem] font-black leading-[1.08] tracking-tight text-white">{inter.title}</h1>
        <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-white/75">{inter.body}</p>

        <div className="mt-10 grid grid-cols-2 gap-3 text-start">
          {copy.tiles.map((t, i) => (
            <div
              key={t.label}
              className="animate-slide-question rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-5 backdrop-blur"
              style={{ animationDelay: `${i * 90}ms`, animationFillMode: "backwards" }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--gold)]">{t.label}</div>
              <div className="mt-2 font-display text-base font-bold leading-snug text-white">{t.value}</div>
            </div>
          ))}
        </div>
      </div>
      <StickyCta label={inter.cta} onClick={onNext} />
    </>
  );
}
