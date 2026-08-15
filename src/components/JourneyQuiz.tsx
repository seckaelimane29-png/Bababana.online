import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Clock, Globe } from "lucide-react";
import { LANGUAGES, type Language } from "@/lib/content";
import { journeyPack, hasNativeJourneyPack, TOPIC_CATEGORY, type JourneyKey } from "@/lib/journeyQuiz";
import { useBooks } from "@/lib/library";
import { isRtl } from "@/lib/i18n";
import { journeyVisuals, hasNativeVisuals } from "@/lib/journeyVisuals";
import { StoryCommit, StoryStat } from "@/components/JourneyStory";
import { journeyCoach, hasNativeCoachPack } from "@/lib/journeyCoach";
import { CoachIntro, CoachMirror, type MirrorLine } from "@/components/JourneyCoach";
import { useTranslatedPack } from "@/lib/useAutoTranslate";

export type JourneyAnswers = Record<JourneyKey, string>;

export function JourneyQuiz({ lang, onDone }: { lang: Language; onDone: (a: JourneyAnswers) => void }) {
  const basePack = useMemo(() => journeyPack(lang), [lang]);
  const baseVisuals = useMemo(() => journeyVisuals(lang), [lang]);
  const baseCoach = useMemo(() => journeyCoach(lang), [lang]);
  const pack = useTranslatedPack("journey-quiz", basePack, lang, hasNativeJourneyPack(lang));
  const visuals = useTranslatedPack("journey-visuals", baseVisuals, lang, hasNativeVisuals(lang));
  const coach = useTranslatedPack("journey-coach", baseCoach, lang, hasNativeCoachPack(lang));
  const rtl = isRtl(lang);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<JourneyAnswers>>({});
  const total = pack.questions.length;
  // flow = three coach-led sections of two questions, with a story beat after each of the
  // first two sections, then a mirror screen that reads their own answers back.
  const flow = useMemo(() => {
    const items: Array<{ kind: "q" | "i" | "s"; index: number } | { kind: "m"; index: number }> = [];
    pack.questions.forEach((_, i) => {
      if (i % 2 === 0) items.push({ kind: "s", index: i / 2 });
      items.push({ kind: "q", index: i });
      if (i === 1) items.push({ kind: "i", index: 0 });
      if (i === 3) items.push({ kind: "i", index: 1 });
    });
    items.push({ kind: "m", index: 0 });
    return items;
  }, [pack]);

  function pick(key: JourneyKey, id: string) {
    setAnswers((a) => ({ ...a, [key]: id }));
    // small pause so the selection is visible, then slide to the next screen
    window.setTimeout(() => setStep((s) => s + 1), 180);
  }

  if (step >= flow.length) {
    return <Results pack={pack} lang={lang} answers={answers as JourneyAnswers} rtl={rtl} onBack={() => setStep(flow.length - 1)} onDone={() => onDone(answers as JourneyAnswers)} />;
  }

  const current = flow[step];
  const q = current.kind === "q" ? pack.questions[current.index] : null;
  const inter = current.kind === "i" ? pack.interstitials[current.index] : null;
  const section = current.kind === "s" ? coach.sections[current.index] : null;
  const answered = flow.slice(0, step).filter((f) => f.kind === "q").length;
  const pct = Math.round((answered / total) * 100);

  const mirrorLines: MirrorLine[] = pack.questions
    .map((question) => {
      const opt = question.options.find((o) => o.id === answers[question.id]);
      return opt ? { key: question.id, emoji: opt.emoji, said: opt.label } : null;
    })
    .filter(Boolean) as MirrorLine[];

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="fixed inset-0 z-50 overflow-y-auto bg-screen-1">
      <div className="mx-auto w-full max-w-md px-6 pt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            aria-label={pack.ui.back}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition disabled:opacity-30"
          >
            <ArrowLeft className={`h-4 w-4 ${rtl ? "rotate-180" : ""}`} />
          </button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-gradient-gold transition-all duration-500" style={{ width: `${Math.max(pct, 6)}%` }} />
          </div>
          <span className="shrink-0 text-xs font-semibold text-white/70">
            {Math.min(answered + 1, total)} {pack.ui.of} {total}
          </span>
        </div>
      </div>

      {inter && current.index === 0 && (
        <StoryStat key="i0" copy={visuals.stat} inter={inter} onNext={() => setStep((s) => s + 1)} />
      )}
      {inter && current.index === 1 && (
        <StoryCommit key="i1" copy={visuals.commit} inter={inter} onNext={() => setStep((s) => s + 1)} />
      )}

      {section && (
        <CoachIntro key={`s${current.index}`} section={section} coachName={coach.coachName} onNext={() => setStep((s) => s + 1)} />
      )}

      {current.kind === "m" && (
        <CoachMirror key="mirror" copy={coach.mirror} lines={mirrorLines} onNext={() => setStep((s) => s + 1)} />
      )}

      {q && (
      <div key={q.id} className="animate-slide-question mx-auto flex w-full max-w-md flex-col px-6 pb-20 pt-14">
        <h1 className="font-display text-[2rem] font-black leading-[1.1] tracking-tight text-white">{q.title}</h1>
        <div className="mt-8 flex flex-col gap-3">
          {q.options.map((o) => {
            const selected = answers[q.id] === o.id;
            return (
              <button
                key={o.id}
                onClick={() => pick(q.id, o.id)}
                className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-start text-base font-medium backdrop-blur transition active:scale-[0.99] ${
                  selected ? "border-[color:var(--gold)] bg-white/25 text-white" : "border-white/20 bg-white/10 text-white/90 hover:border-white/40"
                }`}
              >
                <span className="text-2xl leading-none">{o.emoji}</span>
                <span className="flex-1">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}

function Results({
  pack,
  lang,
  answers,
  rtl,
  onBack,
  onDone,
}: {
  pack: ReturnType<typeof journeyPack>;
  lang: Language;
  answers: JourneyAnswers;
  rtl: boolean;
  onBack: () => void;
  onDone: () => void;
}) {
  const { data: books } = useBooks();
  const category = TOPIC_CATEGORY[answers.topic] ?? "Mindset";
  const book = books?.find((b) => b.category === category && b.is_free) ?? books?.find((b) => b.category === category) ?? books?.[0];
  const minutes = parseInt(answers.minutes, 10) || 15;
  const chosenLang = LANGUAGES.find((l) => l.code === lang);
  const langLabel = chosenLang?.label ?? "";
  const langEmoji = chosenLang?.flag ?? "🌍";
  const message = pack.messages[answers.place] ?? pack.messages.arrived;

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="fixed inset-0 z-50 overflow-y-auto bg-screen-1">
      <div className="animate-slide-question mx-auto flex w-full max-w-md flex-col px-6 pb-44 pt-10 text-center">
        <button onClick={onBack} aria-label={pack.ui.back} className="mx-auto mb-8 grid h-9 w-9 place-items-center self-start rounded-full border border-white/25 bg-white/10 text-white">
          <ArrowLeft className={`h-4 w-4 ${rtl ? "rotate-180" : ""}`} />
        </button>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)]">{pack.ui.kicker}</p>
        <h1 className="mt-4 font-display text-[2.1rem] font-black leading-[1.1] tracking-tight text-white">{pack.ui.title}</h1>
        <p className="mx-auto mt-5 max-w-sm text-lg leading-relaxed text-white/85">{message}</p>

        <div className="mt-9 flex flex-col gap-3 text-start">
          <Card icon={<BookOpen className="h-4 w-4" />} label={pack.ui.yourBook} value={book ? `${book.emoji ?? "📘"} ${book.title}` : pack.ui.loadingBook} />
          <Card icon={<Clock className="h-4 w-4" />} label={pack.ui.yourGoal} value={`${minutes} ${pack.ui.minutesADay}`} />
          <Card icon={<Globe className="h-4 w-4" />} label={pack.ui.yourLang} value={`${langEmoji} ${langLabel}`} />
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 px-6 pb-8 pt-14 [background:linear-gradient(to_top,oklch(0.2_0.05_265/0.8),transparent)]">
        <button
          onClick={onDone}
          className="pointer-events-auto mx-auto block w-full max-w-md rounded-full bg-gradient-gold px-6 py-5 text-lg font-bold text-[color:var(--gold-foreground)] shadow-elevated transition active:scale-[0.98]"
        >
          {pack.ui.cta}
        </button>
      </div>
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold)]">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 font-display text-lg font-bold text-white">{value}</div>
    </div>
  );
}