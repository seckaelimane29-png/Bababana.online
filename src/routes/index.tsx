import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Flame, Globe, Sparkles, Trophy, Users } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { t, isRtl } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/content";
import { useSession, signOut } from "@/lib/auth";
import { useUiTranslation } from "@/lib/useAutoTranslate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yesal Sa Khel — African wisdom. Your language. Every day." },
      { name: "description", content: "Book summaries, daily African proverbs and real immigrant success stories in 5 languages. Elevate your mind — every day." },
      { property: "og:title", content: "Yesal Sa Khel — Elevate Your Mind" },
      { property: "og:description", content: "African wisdom. Your language. Every day." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const nav = useNavigate();
  const { profile, update } = useProfile();
  const { session, ready: authReady } = useSession();
  const lang = profile.language;
  useUiTranslation(lang);

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isRtl(lang) ? "rtl" : "ltr"}>
      <header className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-green shadow-glow font-display text-lg font-bold text-primary-foreground">Y</div>
            <span className="font-display text-lg font-semibold">Yesal Sa Khel</span>
          </div>
          {authReady && session ? (
            <div className="flex items-center gap-2">
              <Link to="/app" className="rounded-full bg-gradient-green px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">{t(lang, "landing.open")}</Link>
              <button
                onClick={async () => { await signOut(); nav({ to: "/", replace: true }); }}
                className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/auth" className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground">Sign in</Link>
          )}
        </div>

        <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
          {LANGUAGES.map((l) => {
            const active = lang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => update({ language: l.code, languageSet: true })}
                aria-pressed={active}
                className={`flex shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition ${active ? "border-primary bg-primary/15 text-foreground" : "border-border bg-card/50 text-muted-foreground hover:text-foreground"}`}
              >
                <span className="text-base">{l.flag}</span>
                {l.label}
              </button>
            );
          })}
        </div>
      </header>

      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-5 pt-16 pb-24 text-center sm:pt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">{t(lang, "lp.pill")}</div>
          <h1 className="font-display text-5xl leading-[0.95] font-bold sm:text-7xl">
            {t(lang, "lp.h1a")}<br />
            <span className="text-[color:var(--gold)]">{t(lang, "lp.h1b")}</span><br />
            {t(lang, "lp.h1c")}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {t(lang, "lp.sub")}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to="/quiz" className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-green px-8 py-4 font-semibold text-primary-foreground shadow-glow transition hover:brightness-110">
              {t(lang, "landing.cta")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a href="#how" className="inline-flex items-center justify-center rounded-full border border-border bg-card/40 px-8 py-4 font-semibold text-foreground transition hover:bg-card">
              {t(lang, "lp.how")}
            </a>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-3xl px-5 py-24">
        <div className="space-y-14 text-center">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">{t(lang, "lp.problem")}</p>
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">{t(lang, "lp.problemTitle")}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{t(lang, "lp.problemSub")}</p>
          </div>
          <div className="border-t border-border pt-14">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">{t(lang, "lp.hear")}</p>
            <p className="text-xl text-muted-foreground">{t(lang, "lp.hearSub")}</p>
          </div>
          <div className="border-t border-border pt-14">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-primary">{t(lang, "lp.answer")}</p>
            <h3 className="font-display text-4xl font-bold sm:text-5xl">Yesal Sa Khel.</h3>
            <p className="mt-6 text-lg text-muted-foreground">{t(lang, "lp.answerSub")}</p>
          </div>
          <div className="border-t border-border pt-14">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">{t(lang, "lp.result")}</p>
            <p className="text-xl">{t(lang, "lp.resultSub")}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/30">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-20 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { i: BookOpen, t: t(lang, "lp.f1"), d: t(lang, "lp.f1d") },
            { i: Sparkles, t: t(lang, "lp.f2"), d: t(lang, "lp.f2d") },
            { i: Users, t: t(lang, "lp.f3"), d: t(lang, "lp.f3d") },
            { i: Globe, t: t(lang, "lp.f4"), d: t(lang, "lp.f4d") },
            { i: Flame, t: t(lang, "lp.f5"), d: t(lang, "lp.f5d") },
            { i: Trophy, t: t(lang, "lp.f6"), d: t(lang, "lp.f6d") },
          ].map((f) => (
            <div key={f.t} className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary/60">
              <f.i className="h-6 w-6 text-primary transition group-hover:text-[color:var(--gold)]" />
              <div className="mt-4 font-display text-lg font-semibold">{f.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 py-24">
        <div className="mb-12 text-center">
          <h2 className="font-display text-4xl font-bold sm:text-5xl">{t(lang, "lp.priceTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t(lang, "lp.priceSub")}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { name: t(lang, "lp.free"), price: "€0", per: "", tag: t(lang, "lp.freeTag"), features: [t(lang, "lp.free1"), t(lang, "lp.free2"), t(lang, "lp.free3"), t(lang, "lp.free4"), t(lang, "lp.free5")], cta: t(lang, "lp.freeCta"), accent: "border" },
            { name: t(lang, "lp.prem"), price: "€9.99", per: t(lang, "lp.premPer"), tag: t(lang, "lp.premTag"), features: [t(lang, "lp.prem1"), t(lang, "lp.prem2"), t(lang, "lp.prem3"), t(lang, "lp.prem4"), t(lang, "lp.prem5"), t(lang, "lp.prem6")], cta: t(lang, "lp.premCta"), accent: "green" },
            { name: t(lang, "lp.found"), price: "€49.99", per: t(lang, "lp.foundPer"), tag: t(lang, "lp.foundTag"), features: [t(lang, "lp.found1"), t(lang, "lp.found2"), t(lang, "lp.found3")], cta: t(lang, "lp.foundCta"), accent: "gold" },
          ].map((p) => {
            const border = p.accent === "green" ? "border-primary shadow-glow" : p.accent === "gold" ? "border-[color:var(--gold)]" : "border-border";
            return (
              <div key={p.name} className={`flex flex-col rounded-2xl border bg-card p-7 ${border}`}>
                <div className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">{p.tag}</div>
                <div className="mt-2 font-display text-2xl font-bold">{p.name}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <div className="font-display text-4xl font-bold">{p.price}</div>
                  {p.per && <div className="text-sm text-muted-foreground">{p.per}</div>}
                </div>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
                  {p.features.map((f) => (<li key={f} className="flex gap-2"><span className="text-primary">✓</span>{f}</li>))}
                </ul>
                <Link to="/quiz" className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold transition ${p.accent === "green" ? "bg-gradient-green text-primary-foreground hover:brightness-110" : p.accent === "gold" ? "bg-gradient-gold text-[color:var(--gold-foreground)] hover:brightness-110" : "border border-border hover:bg-card/60"}`}>{p.cta}</Link>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-display text-lg font-semibold">Yesal Sa Khel</div>
            <div className="text-sm text-muted-foreground">{t(lang, "lp.pill")}</div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">{t(lang, "lp.privacy")}</Link>
            <Link to="/terms" className="hover:text-foreground">{t(lang, "lp.terms")}</Link>
            <a href="mailto:yesalsakhel@gmail.com" className="hover:text-foreground">yesalsakhel@gmail.com</a>
          </div>
          <div className="flex gap-2">
            <span className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">{t(lang, "lp.soonApple")}</span>
            <span className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">{t(lang, "lp.soonGoogle")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
