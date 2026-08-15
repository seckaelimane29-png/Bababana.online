import type { CoachSection, MirrorCopy } from "@/lib/journeyCoach";
import type { JourneyKey } from "@/lib/journeyQuiz";

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

/** The coach avatar — a glowing emerald orb with a gold ring, our own mascot. */
function CoachOrb() {
  return (
    <div className="relative grid h-24 w-24 shrink-0 place-items-center">
      <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full border border-[color:var(--gold)]/40" />
      <div className="grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-white/10 text-3xl backdrop-blur">🦉</div>
    </div>
  );
}

/** Section opener — the coach speaks before each block of questions. */
export function CoachIntro({ section, coachName, onNext }: { section: CoachSection; coachName: string; onNext: () => void }) {
  return (
    <>
      <div className="animate-slide-question mx-auto flex w-full max-w-md flex-col items-center px-6 pb-44 pt-16 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[color:var(--gold)]">{section.step}</p>

        <div className="relative mt-8 w-full">
          <span className="absolute -top-3 start-5 z-10 rounded-full bg-gradient-gold px-4 py-1 text-sm font-bold text-[color:var(--gold-foreground)]">
            {coachName}
          </span>
          <div className="rounded-3xl border border-white/15 bg-white/[0.08] px-6 pb-6 pt-8 text-start backdrop-blur">
            <p className="text-lg leading-relaxed text-white/90">{section.says}</p>
          </div>
          <div className="mx-auto -mt-2 h-5 w-5 rotate-45 rounded-[3px] border-b border-e border-white/15 bg-white/[0.08] backdrop-blur" />
        </div>

        <div className="mt-6">
          <CoachOrb />
        </div>

        <h1 className="mt-6 font-display text-[2.1rem] font-black leading-[1.1] tracking-tight text-white">{section.title}</h1>
      </div>
      <StickyCta label={section.cta} onClick={onNext} />
    </>
  );
}

export type MirrorLine = { key: JourneyKey; emoji: string; said: string };

/** The mirror — reads their own answers back to them, then points at the book. */
export function CoachMirror({ copy, lines, onNext }: { copy: MirrorCopy; lines: MirrorLine[]; onNext: () => void }) {
  return (
    <>
      <div className="animate-slide-question mx-auto flex w-full max-w-md flex-col px-6 pb-44 pt-12">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-[color:var(--gold)]">{copy.kicker}</p>
        <h1 className="mt-4 text-center font-display text-[2rem] font-black leading-[1.1] tracking-tight text-white">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-sm text-center text-base leading-relaxed text-white/70">{copy.subtitle}</p>

        <div className="mt-9 flex flex-col gap-3">
          {lines.map((l, i) => (
            <div
              key={l.key}
              className="animate-slide-question rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl leading-none">{l.emoji}</span>
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold)]">{copy.saidLabel}</div>
                  <p className="mt-1.5 font-display text-lg font-bold leading-snug text-white">“{l.said}”</p>
                  <p className="mt-2 border-s-2 border-[color:var(--gold)]/40 ps-3 text-sm leading-relaxed text-white/70">
                    {copy.reflections[l.key]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-9 text-center text-base leading-relaxed text-white/85">{copy.closing}</p>
      </div>
      <StickyCta label={copy.cta} onClick={onNext} />
    </>
  );
}
