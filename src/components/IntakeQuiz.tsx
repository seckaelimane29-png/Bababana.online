import { useMemo, useState } from "react";
import { type IntakeStep, type Language } from "@/lib/content";
import { intakeQuiz } from "@/lib/intake";
import { t, isRtl } from "@/lib/i18n";
import type { IntakeAnswers } from "@/lib/profile";
import { Check } from "lucide-react";

type Answer = string | string[] | number;

/** Full-bleed cinematic screen: gradient backdrop, big type, fixed white pill CTA. */
function Screen({
  bg,
  children,
  cta,
  onCta,
  disabled,
  stepKey,
  rtl,
}: {
  bg: string;
  children: React.ReactNode;
  cta: string;
  onCta: () => void;
  disabled?: boolean;
  stepKey: string | number;
  rtl?: boolean;
}) {
  return (
    <div dir={rtl ? "rtl" : "ltr"} className={`fixed inset-0 z-50 overflow-y-auto ${bg}`}>
      <div key={stepKey} className="animate-fade-in mx-auto flex min-h-full w-full max-w-md flex-col px-6 pb-40 pt-16 text-center">
        {children}
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 px-6 pb-8 pt-14 [background:linear-gradient(to_top,oklch(0.2_0.05_265/0.75),transparent)]">
        <button
          onClick={onCta}
          disabled={disabled}
          className="pointer-events-auto mx-auto block w-full max-w-md rounded-full bg-white px-6 py-5 text-lg font-bold text-background shadow-elevated transition active:scale-[0.98] disabled:opacity-40"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">{children}</p>;
}

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-4 font-display text-[2.35rem] font-black leading-[1.05] tracking-tight text-white">{children}</h2>;
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="mx-auto mt-4 max-w-xs text-base leading-relaxed text-white/75">{children}</p>;
}

export function IntakeQuiz({ onDone, lang }: { onDone: (answers: IntakeAnswers) => void; lang: Language }) {
  const STEPS = useMemo(() => intakeQuiz(lang), [lang]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswers>({});

  const step: IntakeStep = STEPS[index];
  const total = STEPS.filter((s) => s.kind === "q").length;
  const answered = STEPS.slice(0, index).filter((s) => s.kind === "q").length;
  const qNumber = step.kind === "q" ? answered + 1 : answered;
  const progress = Math.round((answered / total) * 100);

  const current = step.kind === "q" ? answers[step.id] : undefined;

  const canContinue = useMemo(() => {
    if (step.kind !== "q") return true;
    if (step.type === "single") return typeof current === "string" && current.length > 0;
    if (step.type === "multi") return Array.isArray(current) && current.length > 0;
    if (step.type === "scale") return typeof current === "number";
    return typeof current === "string" && current.trim().length > 3;
  }, [step, current]);

  function setAnswer(v: Answer) {
    if (step.kind !== "q") return;
    setAnswers((prev) => ({ ...prev, [step.id]: v }));
  }

  function next() {
    if (!canContinue) return;
    if (index === STEPS.length - 1) { onDone(answers); return; }
    setIndex(index + 1);
  }

  if (step.kind !== "q") {
    return <Interstitial kind={step.kind} answers={answers} onContinue={next} stepKey={index} lang={lang} />;
  }

  return (
    <Screen bg="bg-screen-1" rtl={isRtl(lang)} stepKey={index} cta={index === STEPS.length - 1 ? t(lang, "quiz.build") : t(lang, "quiz.continue")} onCta={next} disabled={!canContinue}>
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">
          <span>{t(lang, "quiz.question")} {qNumber} / {total}</span>
          <span>{t(lang, "quiz.before")}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${Math.max(8, progress)}%` }} />
        </div>
      </div>

      <Title>{step.q}</Title>
      {step.sub && <Sub>{step.sub}</Sub>}

      <div className="mt-10 text-left">
        {step.type === "single" && <SingleChoice options={step.options} value={current as string | undefined} onChange={setAnswer} />}
        {step.type === "multi" && <MultiChoice options={step.options} value={(current as string[]) ?? []} onChange={setAnswer} />}
        {step.type === "scale" && <Scale min={step.min} max={step.max} low={step.low} high={step.high} value={current as number | undefined} onChange={setAnswer} />}
        {step.type === "text" && <TextField value={(current as string) ?? ""} onChange={setAnswer} placeholder={step.placeholder} />}
      </div>
    </Screen>
  );
}

function SingleChoice({ options, value, onChange }: { options: string[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-base font-medium backdrop-blur transition ${selected ? "border-white bg-white/25 text-white" : "border-white/20 bg-white/10 text-white/85"}`}>
            <span>{opt}</span>
            {selected && <Check className="h-5 w-5 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoice({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  function toggle(opt: string) {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  }
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <button key={opt} onClick={() => toggle(opt)} className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left text-base font-medium backdrop-blur transition ${selected ? "border-white bg-white/25 text-white" : "border-white/20 bg-white/10 text-white/85"}`}>
            <span>{opt}</span>
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold ${selected ? "border-white bg-white text-background" : "border-white/40"}`}>{selected ? "✓" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}

function Scale({ min, max, low, high, value, onChange }: { min: number; max: number; low: string; high: string; value?: number; onChange: (v: number) => void }) {
  const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {nums.map((n) => {
          const selected = value === n;
          return (
            <button key={n} onClick={() => onChange(n)} className={`aspect-square rounded-xl border text-base font-bold backdrop-blur transition ${selected ? "border-white bg-white text-background" : "border-white/20 bg-white/10 text-white/85"}`}>{n}</button>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between text-[11px] uppercase tracking-widest text-white/60">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function TextField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className="w-full rounded-2xl border border-white/25 bg-white/10 p-4 text-base leading-relaxed text-white backdrop-blur placeholder:text-white/50 focus:border-white focus:outline-none" />
  );
}

function Interstitial({
  kind,
  answers,
  onContinue,
  stepKey,
  lang,
}: {
  kind: "pill" | "commit" | "stat" | "chart" | "lie";
  answers: IntakeAnswers;
  onContinue: () => void;
  stepKey: number;
  lang: Language;
}) {
  const rtl = isRtl(lang);
  const struggles = (answers.struggles as string[]) ?? [];

  if (kind === "stat") {
    return (
      <Screen bg="bg-screen-2" rtl={rtl} stepKey={stepKey} cta={t(lang, "quiz.stat.cta")} onCta={onContinue}>
        <Kicker>{t(lang, "quiz.stat.kicker")}</Kicker>
        <Title>{t(lang, "quiz.stat.title")}</Title>
        <div className="relative mx-auto mt-10 grid h-64 w-64 place-items-center">
          <div className="absolute inset-0 rounded-full border border-white/25" />
          <div className="absolute inset-0 rounded-full blur-2xl [background:oklch(0.6_0.2_20/0.35)]" />
          <span className="relative font-display text-[5.5rem] font-black leading-none text-white">8%</span>
        </div>
        <p className="mt-10 text-xl font-semibold text-white">{t(lang, "quiz.stat.line1")}</p>
        <p className="mt-2 text-base text-white/60">{t(lang, "quiz.stat.line2")}</p>
      </Screen>
    );
  }

  if (kind === "lie") {
    return (
      <Screen bg="bg-screen-3" rtl={rtl} stepKey={stepKey} cta={t(lang, "quiz.lie.cta")} onCta={onContinue}>
        <Title>{t(lang, "quiz.lie.title")}</Title>
        <Sub>{t(lang, "quiz.lie.sub")}</Sub>
        <div className="mt-10">
          <svg viewBox="0 0 320 180" className="w-full" role="img" aria-label="Promised growth versus real retention">
            {[40, 80, 120, 160].map((y) => (
              <line key={y} x1="10" y1={y} x2="310" y2={y} stroke="white" strokeOpacity="0.12" />
            ))}
            <path d="M10 165 C 90 160, 150 60, 310 25" fill="none" stroke="oklch(0.8 0.2 150)" strokeWidth="4" strokeDasharray="10 9" strokeLinecap="round" />
            <path d="M10 120 C 100 108, 190 112, 300 140" fill="none" stroke="oklch(0.68 0.22 20)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="300" cy="140" r="7" fill="oklch(0.68 0.22 20)" />
            <text x="205" y="55" fill="oklch(0.85 0.18 150)" fontSize="14" fontWeight="700">{t(lang, "quiz.lie.promised")}</text>
            <text x="185" y="168" fill="oklch(0.75 0.2 20)" fontSize="14" fontWeight="700">{t(lang, "quiz.lie.reality")}</text>
          </svg>
        </div>
        <p className="mt-8 text-base text-white/75">{t(lang, "quiz.lie.tail")}</p>
      </Screen>
    );
  }

  if (kind === "chart") {
    return (
      <Screen bg="bg-screen-2" stepKey={stepKey} rtl={rtl} cta={t(lang, "quiz.chart.cta")} onCta={onContinue}>
        <Title>{t(lang, "quiz.chart.title")}</Title>
        <div className="mt-12 flex items-end justify-center gap-10">
          <div className="flex flex-col items-center">
            <div className="flex w-24 items-start justify-center rounded-t-3xl pt-3 [background:linear-gradient(180deg,oklch(0.65_0.22_20),oklch(0.55_0.22_18))]" style={{ height: 90 }}>
              <span className="text-lg font-black text-white">22%</span>
            </div>
            <span className="mt-3 text-sm font-semibold text-white">{t(lang, "quiz.chart.you")}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex w-24 items-start justify-center rounded-t-3xl pt-3 [background:linear-gradient(180deg,oklch(0.82_0.19_155),oklch(0.62_0.18_152))]" style={{ height: 240 }}>
              <span className="text-lg font-black text-background">78%</span>
            </div>
            <span className="mt-3 text-sm font-semibold text-white/80">{t(lang, "quiz.chart.daily")}</span>
          </div>
        </div>
        <p className="mt-10 text-base text-white/75">{t(lang, "quiz.chart.tail")}</p>
      </Screen>
    );
  }

  if (kind === "pill") {
    return (
      <Screen bg="bg-screen-3" rtl={rtl} stepKey={stepKey} cta={t(lang, "quiz.pill.cta")} onCta={onContinue}>
        <Title>{t(lang, "quiz.pill.title")}</Title>
        <Sub>{t(lang, "quiz.pill.sub")}</Sub>
        {struggles.length > 0 && (
          <p className="mt-4 text-sm text-white/60">{t(lang, "quiz.pill.said")}: “{struggles[0]}”. {t(lang, "quiz.pill.saidTail")}</p>
        )}
        <div className="mt-10 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.75_0.2_20)]">Red</p>
            <p className="mt-2 text-base font-semibold text-white">{t(lang, "quiz.pill.red")}</p>
            <p className="mt-1 text-xs text-white/60">{t(lang, "quiz.pill.redSub")}</p>
          </div>
          <div className="rounded-2xl border-2 border-white/70 bg-white/20 p-4 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.85_0.18_155)]">Green</p>
            <p className="mt-2 text-base font-semibold text-white">{t(lang, "quiz.pill.green")}</p>
            <p className="mt-1 text-xs text-white/70">{t(lang, "quiz.pill.greenSub")}</p>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen bg="bg-screen-4" rtl={rtl} stepKey={stepKey} cta={t(lang, "quiz.commit.cta")} onCta={onContinue}>
      <Kicker>{t(lang, "quiz.commit.kicker")}</Kicker>
      <Title>{t(lang, "quiz.commit.title")}</Title>
      <Sub>{t(lang, "quiz.commit.sub")}</Sub>
      <div className="mt-10 grid grid-cols-2 gap-3 text-left">
        {[
          [t(lang, "quiz.commit.a"), t(lang, "quiz.commit.aSub")],
          [t(lang, "quiz.commit.b"), t(lang, "quiz.commit.bSub")],
          [t(lang, "quiz.commit.c"), t(lang, "quiz.commit.cSub")],
          [t(lang, "quiz.commit.d"), t(lang, "quiz.commit.dSub")],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{k}</p>
            <p className="mt-1 text-base font-semibold text-white">{v}</p>
          </div>
        ))}
      </div>
    </Screen>
  );
}
