import { useMemo, useState } from "react";
import { comprehensionQuiz, type Book, type Language, type QuizPack, type QuizLabels } from "@/lib/content";
import { t } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";
import { Check, X, Sparkles } from "lucide-react";

export function BookQuiz({ book, pack, labels, onDone }: { book: Book; pack?: QuizPack; labels?: QuizLabels; onDone?: (score: number) => void }) {
  const questions = useMemo(() => comprehensionQuiz(book, pack, labels), [book, pack, labels]);
  const { profile } = useProfile();
  const lang = profile.language;
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = questions.length;
  const q = questions[index];

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setCorrect((c) => c + 1);
  }

  function next() {
    if (index === total - 1) {
      setFinished(true);
      onDone?.(correct);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  }

  function retry() {
    setIndex(0); setPicked(null); setCorrect(0); setFinished(false); setStarted(true);
  }

  if (!started) {
    return <ReminderScreen book={book} intake={profile.intake} lang={lang} onStart={() => setStarted(true)} />;
  }

  if (finished) {
    return <ResultScreen book={book} score={correct} total={total} intake={profile.intake} lang={lang} onRetry={retry} />;
  }

  const progress = ((index + (picked !== null ? 1 : 0)) / total) * 100;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6">
      <BgAura hue={book.hue} />
      <div className="relative">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span>{t(lang, "quiz.question")} {index + 1} / {total}</span>
          <span className="text-[color:var(--gold)]">{correct} {t(lang, "bq.correct")}</span>
        </div>
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-green transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div key={index} className="animate-fade-in">
          <h3 className="font-display text-xl font-bold leading-snug">{q.q}</h3>

          <div className="mt-5 flex flex-col gap-2">
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answer;
              const isPicked = picked === i;
              let cls = "border-border bg-background hover:border-primary/40";
              if (picked !== null && isAnswer) cls = "border-primary bg-primary/15";
              else if (isPicked) cls = "border-destructive bg-destructive/10";
              else if (picked !== null) cls = "border-border opacity-50";
              return (
                <button key={i} onClick={() => choose(i)} disabled={picked !== null} className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${cls}`}>
                  <span>{opt}</span>
                  {picked !== null && isAnswer && <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
                  {picked !== null && isPicked && !isAnswer && <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <div className="mt-4 animate-fade-in rounded-2xl border border-border bg-background/60 p-4">
              <p className={`text-xs font-bold uppercase tracking-widest ${picked === q.answer ? "text-primary" : "text-destructive"}`}>
                {picked === q.answer ? t(lang, "bq.right") : t(lang, "bq.wrong")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{q.why}</p>
            </div>
          )}

          <button onClick={next} disabled={picked === null} className="mt-6 w-full rounded-full bg-gradient-green px-6 py-4 font-semibold text-primary-foreground shadow-glow transition disabled:opacity-40">
            {index === total - 1 ? t(lang, "bq.result") : t(lang, "bq.next")}
          </button>
        </div>
      </div>
    </div>
  );
}

function BgAura({ hue }: { hue: number }) {
  return (
    <>
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-40 blur-3xl" style={{ background: `oklch(0.55 0.22 ${hue})` }} />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full opacity-25 blur-3xl" style={{ background: "oklch(0.66 0.17 148)" }} />
    </>
  );
}

type Intake = Record<string, string | string[] | number> | null;

function IntakeRecall({ intake, lang }: { intake: Intake; lang: Language }) {
  if (!intake) return null;
  const why = typeof intake.why === "string" ? intake.why : null;
  const struggles = Array.isArray(intake.struggles) ? intake.struggles : [];
  const promise = typeof intake.promise === "string" ? intake.promise : null;
  const readiness = typeof intake.readiness === "number" ? intake.readiness : null;
  if (!why && !struggles.length && !promise) return null;

  return (
    <div className="rounded-2xl border border-[color:var(--gold)]/40 bg-background/50 p-5 text-left">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--gold)]">
        <Sparkles className="h-3 w-3" /> {t(lang, "bq.saidBefore")}
      </p>
      <ul className="mt-3 space-y-2 text-sm text-foreground/85">
        {why && <li>“{why}”</li>}
        {struggles.slice(0, 2).map((s) => <li key={s}>“{s}”</li>)}
        {readiness !== null && <li>{t(lang, "bq.readiness")} <span className="font-bold text-primary">{readiness}/10</span>.</li>}
        {promise && <li className="border-t border-border pt-2 font-display text-base font-semibold text-foreground">“{promise}”</li>}
      </ul>
    </div>
  );
}

function ReminderScreen({ book, intake, lang, onStart }: { book: Book; intake: Intake; lang: Language; onStart: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7">
      <BgAura hue={book.hue} />
      <div className="relative animate-fade-in">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">{t(lang, "bq.finished")}</p>
        <h3 className="mt-3 font-display text-2xl font-black leading-tight">{t(lang, "bq.land")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{total5(book)} · {t(lang, "bq.landSub")}</p>
        <div className="mt-5"><IntakeRecall intake={intake} lang={lang} /></div>
        <button onClick={onStart} className="mt-6 w-full rounded-full bg-gradient-green px-6 py-4 font-semibold text-primary-foreground shadow-glow transition active:scale-[0.98]">
          {t(lang, "bq.start")}
        </button>
      </div>
    </div>
  );
}

function total5(book: Book) {
  return comprehensionQuiz(book).length;
}

function ResultScreen({ book, score, total, intake, lang, onRetry }: { book: Book; score: number; total: number; intake: Intake; lang: Language; onRetry: () => void }) {
  const pct = (score / total) * 100;
  const label = pct >= 90 ? t(lang, "bq.high") : pct >= 60 ? t(lang, "bq.mid") : t(lang, "bq.low");

  async function share() {
    const text = `I scored ${score}/${total} on "${book.title}" by ${book.author} — reading on Yesal Sa Khel 🌍`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ text, title: book.title }); return; } catch { /* fall through */ }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) await navigator.clipboard.writeText(text);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-center">
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ background: `radial-gradient(400px 400px at 50% 0%, oklch(0.55 0.22 ${book.hue} / 0.4), transparent 60%)` }} />
      <div className="relative animate-fade-in">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">{t(lang, "bq.score")}</p>
        <div className="mt-4 font-display text-7xl font-black leading-none">
          <span className="text-primary">{score}</span>
          <span className="text-muted-foreground"> / {total}</span>
        </div>
        <p className="mx-auto mt-4 max-w-xs text-sm text-foreground/80">{label}</p>
        <div className="mt-6"><IntakeRecall intake={intake} lang={lang} /></div>
        <div className="mt-8 flex flex-col gap-2">
          <button onClick={onRetry} className="w-full rounded-full bg-gradient-green px-6 py-4 font-semibold text-primary-foreground shadow-glow">{t(lang, "bq.retry")}</button>
          <button onClick={share} className="w-full rounded-full border border-border px-6 py-4 text-sm font-semibold text-foreground">{t(lang, "bq.share")}</button>
        </div>
      </div>
    </div>
  );
}
