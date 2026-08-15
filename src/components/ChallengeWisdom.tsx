import { useMemo, useState } from "react";
import { X, Check, Flame, ArrowRight } from "lucide-react";
import type { DbInsight } from "@/lib/library";

type Q = { scenario: string; prompt: string; options: string[]; answer: number; note: string };

function firstSentence(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  const dot = clean.indexOf(". ");
  return dot > 30 ? clean.slice(0, dot + 1) : clean.slice(0, 160);
}

/** Builds up to 4 situational questions from a book's insights. */
function buildQuestions(insights: DbInsight[], author: string): Q[] {
  const usable = insights.filter((i) => i.title && i.body).slice(0, 4);
  return usable.map((ins, idx) => {
    const others = insights.filter((o) => o.id !== ins.id && o.title).map((o) => o.title as string);
    const distractors = others.slice(0, 2);
    const options = [ins.title as string, ...distractors];
    // deterministic shuffle so the answer isn't always first
    const shift = idx % options.length;
    const rotated = [...options.slice(shift), ...options.slice(0, shift)];
    return {
      scenario: firstSentence(ins.body as string),
      prompt: `What does ${author} say matters here?`,
      options: rotated,
      answer: rotated.indexOf(ins.title as string),
      note: ins.wolof_wisdom || (ins.body as string).slice(0, 180),
    };
  });
}

export function ChallengeWisdom({ title, author, insights, onClose }: { title: string; author: string; insights: DbInsight[]; onClose: () => void }) {
  const questions = useMemo(() => buildQuestions(insights, author), [insights, author]);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const q = questions[index];

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  }

  function next() {
    if (index === total - 1) return setDone(true);
    setIndex(index + 1);
    setPicked(null);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="font-display text-base font-bold">Challenge Your Wisdom</div>
        <div className="h-9 w-9" />
      </header>

      <div className="mx-auto max-w-md px-5 py-8">
        {!started && (
          <div className="animate-fade-in text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-[color:var(--gold)]/50 bg-card">
              <Flame className="h-10 w-10 text-[color:var(--gold)]" />
            </div>
            <h2 className="mt-6 font-display text-3xl font-black text-primary">Challenge Your Wisdom</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {total} situational questions on {title}. No facts to memorise — only choices to make. Each answer comes with a mentor note.
            </p>
            <button onClick={() => setStarted(true)} disabled={!total} className="mt-10 w-full rounded-full bg-gradient-green px-6 py-4 font-semibold text-primary-foreground shadow-glow disabled:opacity-40">
              Start <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
        )}

        {started && !done && q && (
          <div key={index} className="animate-fade-in">
            <div className="mb-5 flex justify-center gap-2">
              {questions.map((_, i) => (
                <span key={i} className={`h-1.5 w-10 rounded-full ${i <= index ? "bg-primary" : "bg-secondary"}`} />
              ))}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Question {index + 1} of {total}</p>

            <div className="mt-4 rounded-2xl border-l-2 border-[color:var(--gold)] bg-card p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">Scenario</p>
              <p className="mt-2 text-[15px] italic leading-relaxed text-foreground/85">{q.scenario}</p>
            </div>

            <h3 className="mt-6 font-display text-xl font-bold">{q.prompt}</h3>

            <div className="mt-4 flex flex-col gap-2">
              {q.options.map((opt, i) => {
                const isAnswer = i === q.answer;
                let cls = "border-border bg-card hover:border-primary/40";
                if (picked !== null && isAnswer) cls = "border-primary bg-primary/15";
                else if (picked === i) cls = "border-destructive bg-destructive/10";
                else if (picked !== null) cls = "border-border opacity-50";
                return (
                  <button key={i} onClick={() => choose(i)} disabled={picked !== null} className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-left text-sm transition ${cls}`}>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                    <span className="pt-1">{opt}</span>
                    {picked !== null && isAnswer && <Check className="ml-auto mt-1 h-4 w-4 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div className="mt-4 animate-fade-in rounded-2xl border border-[color:var(--gold)]/30 bg-card p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">Mentor note</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{q.note}</p>
              </div>
            )}

            <button onClick={next} disabled={picked === null} className="mt-6 w-full rounded-full bg-gradient-green px-6 py-4 font-semibold text-primary-foreground shadow-glow disabled:opacity-40">
              {index === total - 1 ? "See my score" : "Next"}
            </button>
          </div>
        )}

        {done && (
          <div className="animate-fade-in py-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--gold)]">Your score</p>
            <div className="mt-4 font-display text-7xl font-black">
              <span className="text-primary">{score}</span>
              <span className="text-muted-foreground"> / {total}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {score === total ? "Perfect — the wisdom landed." : "Go back through the insights and try again."}
            </p>
            <button
              onClick={() => { setIndex(0); setPicked(null); setScore(0); setDone(false); }}
              className="mt-8 w-full rounded-full bg-gradient-green px-6 py-4 font-semibold text-primary-foreground shadow-glow"
            >
              Try again
            </button>
            <button onClick={onClose} className="mt-2 w-full rounded-full border border-border px-6 py-4 text-sm font-semibold">Back to the book</button>
          </div>
        )}
      </div>
    </div>
  );
}
