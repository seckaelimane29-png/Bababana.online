import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AVATARS, BADGES, LANGUAGES, type Badge, type Language } from "@/lib/content";
import { useProfile } from "@/lib/profile";
import { Avatar } from "@/components/BookCover";
import { Flame, Share2 } from "lucide-react";
import { t, badgeLabel, isRtl } from "@/lib/i18n";
import { THEMES, useTheme } from "@/lib/theme";
import { useSession, signOut } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
import { useSubscription, formatDate, countdown } from "@/lib/subscription";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { amIAdmin } from "@/lib/billing.functions";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "You — Yesal Sa Khel" }, { name: "description", content: "Your reading profile and streak." }] }),
  component: ProfileScreen,
});

function ProfileScreen() {
  const nav = useNavigate();
  const { profile, update } = useProfile();
  const { theme, setTheme } = useTheme();
  const lang = profile.language;
  const { session, user } = useSession();
  const sub = useSubscription();
  const checkAdmin = useServerFn(amIAdmin);
  const { data: isAdmin } = useQuery({ queryKey: ["is-admin", user?.id], queryFn: () => checkAdmin(), enabled: !!session });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!sub.inGrace) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sub.inGrace]);

  const completeness = [profile.name !== "Friend", !!profile.avatar, !!profile.badge, !!profile.language, !!profile.goalMinutes].filter(Boolean).length;
  const pct = Math.round((completeness / 5) * 100);

  async function shareCard() {
    const text = `${profile.avatar} ${profile.name} · ${profile.badge} · 🔥 ${profile.streak}-day streak on Yesal Sa Khel — Elevate Your Mind 🌍`;
    if (navigator.share) await navigator.share({ text });
    else await navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-6 px-5 pt-6 pb-8" dir={isRtl(lang) ? "rtl" : "ltr"}>
      <div className="rounded-3xl border border-[color:var(--gold)]/40 bg-hero p-6 shadow-elevated">
        <div className="flex items-center gap-4">
          <Avatar emoji={profile.avatar} size={72} />
          <div className="flex-1">
            <input value={profile.name} onChange={(e) => update({ name: e.target.value })} className="w-full bg-transparent font-display text-2xl font-bold focus:outline-none" />
            <div className="text-xs text-[color:var(--gold)]">{badgeLabel(lang, profile.badge)}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Flame className="h-3 w-3 text-[color:var(--gold)]" /> {profile.streak} {t(lang, "prof.streak")} · {profile.goalMinutes} {t(lang, "prof.perDay")}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground"><span>{t(lang, "prof.strength")}</span><span>{pct}%</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-green" style={{ width: `${pct}%` }} /></div>
        </div>
        <button onClick={shareCard} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-green py-3 font-semibold text-primary-foreground shadow-glow"><Share2 className="h-4 w-4" /> {t(lang, "prof.share")}</button>
      </div>

      <Section title={t(lang, "prof.avatar")}>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button key={a} onClick={() => update({ avatar: a })} className={`grid h-12 w-12 place-items-center rounded-full border text-xl transition ${profile.avatar === a ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-card"}`}>{a}</button>
          ))}
        </div>
      </Section>

      <Section title={t(lang, "prof.badge")}>
        <div className="grid gap-2">
          {BADGES.map((b) => (
            <button key={b} onClick={() => update({ badge: b as Badge })} className={`rounded-xl border p-3 text-left transition ${profile.badge === b ? "border-primary bg-primary/10" : "border-border bg-card"}`}>{badgeLabel(lang, b)}</button>
          ))}
        </div>
      </Section>

      <Section title={t(lang, "prof.goal")}>
        <div className="grid grid-cols-3 gap-2">
          {[5, 10, 15].map((m) => (
            <button key={m} onClick={() => update({ goalMinutes: m })} className={`rounded-xl border p-4 font-display text-lg font-bold transition ${profile.goalMinutes === m ? "border-primary bg-primary/10" : "border-border bg-card"}`}>{m}<span className="ml-1 text-xs font-normal text-muted-foreground">{t(lang, "prof.min")}</span></button>
          ))}
        </div>
      </Section>

      <Section title="Appearance">
        <div className="grid gap-2">
          {THEMES.map((th) => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${theme === th.id ? "border-primary bg-primary/10" : "border-border bg-card"}`}
            >
              <span className="flex overflow-hidden rounded-full border border-border">
                {th.swatch.map((c) => (
                  <span key={c} className="h-6 w-4" style={{ background: c }} />
                ))}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{th.label}</span>
                <span className="block text-[11px] text-muted-foreground">{th.hint}</span>
              </span>
              {theme === th.id && <span className="text-xs text-primary">{t(lang, "prof.active")}</span>}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t(lang, "prof.language")}>
        <div className="grid grid-cols-1 gap-2">
          {LANGUAGES.map((l) => (
            <button key={l.code} onClick={() => update({ language: l.code as Language })} className={`flex items-center justify-between rounded-xl border p-3 transition ${profile.language === l.code ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
              <span className="flex items-center gap-3"><span className="text-xl">{l.flag}</span>{l.label}</span>
              {profile.language === l.code && <span className="text-xs text-primary">{t(lang, "prof.active")}</span>}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Account">
        {session && (
          <div className="mb-3 rounded-2xl border p-5" style={{ borderColor: "var(--gold)", background: "var(--navy)" }}>
            <div className="text-[11px] uppercase tracking-[0.25em] text-white/50">Your plan</div>
            {sub.isPremium ? (
              <>
                <div className="mt-1 font-display text-xl font-bold text-white">
                  {sub.status === "trial" ? "Free trial" : `${sub.planName ?? "Premium"} Premium`} ✅
                </div>
                <div className="mt-2 text-sm text-white/70">
                  {sub.startDate && <div>Started: {formatDate(sub.startDate)}</div>}
                  {sub.isLifetime ? <div>Lifetime access — never expires</div> : <div>Expires: {formatDate(sub.endDate)}</div>}
                  {sub.inGrace && (
                    <div className="mt-2 font-display text-lg font-bold tabular-nums" style={{ color: "var(--bill-danger)" }}>
                      Full access ends in: {countdown(sub.graceEndDate, now)}
                    </div>
                  )}
                </div>
                {!sub.isLifetime && (
                  <div className="mt-4 flex gap-2">
                    <Link to="/pricing" className="flex-1 rounded-full py-2.5 text-center text-sm font-bold" style={{ background: "var(--gold)", color: "var(--navy)" }}>Renew early</Link>
                    <Link to="/pricing" className="flex-1 rounded-full border border-white/25 py-2.5 text-center text-sm text-white/80">Change plan</Link>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mt-1 font-display text-xl font-bold text-white">
                  {sub.endDate ? "Expired ❌" : "Free Plan"}
                </div>
                <div className="mt-2 text-sm text-white/70">
                  {sub.endDate ? `Expired: ${formatDate(sub.endDate)}` : "Insight 1 of every book, 3 proverbs a day and all quotes."}
                </div>
                <Link to="/pricing" className="mt-4 block rounded-full py-3 text-center text-sm font-bold" style={{ background: "var(--gold)", color: "var(--navy)" }}>
                  {sub.endDate ? "Renew now — from €6.99/month" : "Unlock full access — from €6.99/month"}
                </Link>
              </>
            )}
          </div>
        )}
        {session ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-sm font-semibold">{user?.email}</div>
            <div className="mt-1 text-xs text-muted-foreground">Signed in — your reading is saved to this account.</div>
            <button
              onClick={async () => { await signOut(); nav({ to: "/", replace: true }); }}
              className="mt-3 w-full rounded-full border border-border py-3 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Sign out
            </button>
            {isAdmin && (
              <Link to="/admin" className="mt-2 flex w-full items-center justify-center rounded-full border border-[color:var(--gold)]/50 py-3 text-sm text-[color:var(--gold)]">
                Admin dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-sm font-semibold">You are reading as a guest</div>
            <div className="mt-1 text-xs text-muted-foreground">Create a free account to keep your books and streak on every device.</div>
            <Link to="/auth" className="mt-3 flex w-full items-center justify-center rounded-full bg-gradient-green py-3 text-sm font-semibold text-primary-foreground shadow-glow">Sign in or create account</Link>
          </div>
        )}
      </Section>

      <div className="pt-4 text-center text-xs text-muted-foreground">
        {t(lang, "prof.support")}: <a className="underline" href="mailto:yesalsakhel@gmail.com">yesalsakhel@gmail.com</a>
      </div>
      <button onClick={() => { localStorage.removeItem("ysk:profile:v1"); nav({ to: "/onboarding" }); }} className="w-full rounded-full border border-border py-3 text-sm text-muted-foreground">{t(lang, "prof.reset")}</button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}