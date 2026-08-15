import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AVATARS, BADGES, type Badge } from "@/lib/content";
import { useProfile } from "@/lib/profile";
import { Avatar } from "@/components/BookCover";
import { ArrowRight } from "lucide-react";
import { t, tf, badgeLabel, isRtl } from "@/lib/i18n";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started — Yesal Sa Khel" }, { name: "description", content: "Set up your reading profile in 3 steps." }] }),
  component: Onboarding,
});

const STEPS = 0; // motivation + daily goal already answered in the journey quiz

function Onboarding() {
  const nav = useNavigate();
  const { profile, update } = useProfile();
  const lang = profile.language;
  const [step, setStep] = useState(1);
  const motivation = profile.motivation;
  const goal = profile.goalMinutes;
  const [name, setName] = useState<string>(profile.name === "Friend" ? "" : profile.name);
  const [avatar, setAvatar] = useState<string>(profile.avatar);
  const [badge, setBadge] = useState<Badge>(profile.badge);

  const pct = Math.round((step / (STEPS + 1)) * 100);

  function next() { if (step < STEPS + 1) setStep(step + 1); }
  function finish() {
    update({ motivation, goalMinutes: goal, name: name.trim() || t(lang, "ob.friend"), avatar, badge, onboarded: true });
    nav({ to: "/app" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground" dir={isRtl(lang) ? "rtl" : "ltr"}>
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-md px-5 pt-6 pb-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{tf(lang, "ob.progress", { n: pct })}</span>
            <span>{tf(lang, "ob.step", { a: step, b: STEPS + 1 })}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-gradient-green transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          {pct < 100 && <div className="mt-2 text-[11px] text-[color:var(--gold)]">{t(lang, "ob.unlock")}</div>}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-10">
        {step === 1 && (
          <Step title={t(lang, "ob.q3")} sub={t(lang, "ob.q3sub")}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t(lang, "ob.namePh")} className="rounded-2xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{t(lang, "prof.avatar")}</div>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((a) => (
                  <button key={a} onClick={() => setAvatar(a)} className={`grid h-12 w-12 place-items-center rounded-full border text-xl transition ${avatar === a ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-card"}`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{t(lang, "prof.badge")}</div>
              <div className="grid grid-cols-1 gap-2">
                {BADGES.map((b) => (
                  <button key={b} onClick={() => setBadge(b)} className={`rounded-xl border p-3 text-left transition ${badge === b ? "border-primary bg-primary/10" : "border-border bg-card"}`}>{badgeLabel(lang, b)}</button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[color:var(--gold)]/40 bg-hero p-5 shadow-elevated">
              <div className="mb-2 text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">{t(lang, "ob.preview")}</div>
              <div className="flex items-center gap-3">
                <Avatar emoji={avatar} />
                <div>
                  <div className="font-display text-xl font-bold">{name || t(lang, "ob.friend")}</div>
                  <div className="text-xs text-muted-foreground">{badgeLabel(lang, badge)} · 🔥 0 {t(lang, "prof.streak")} · {goal} {t(lang, "prof.perDay")}</div>
                </div>
              </div>
            </div>
          </Step>
        )}

        <div className="mt-auto pt-8">
          {step < STEPS + 1 ? (
            <button onClick={next} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-green px-6 py-4 font-semibold text-primary-foreground shadow-glow transition hover:brightness-110">
              {t(lang, "ob.continue")} <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={finish} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-green px-6 py-4 font-semibold text-primary-foreground shadow-glow transition hover:brightness-110">
              {t(lang, "ob.finish")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold leading-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{sub}</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}