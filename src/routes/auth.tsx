import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { useProfile } from "@/lib/profile";
import { isRtl } from "@/lib/i18n";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Yesal Sa Khel" },
      { name: "description", content: "Create your free Yesal Sa Khel account with email or Google and keep your books, streak and language on every device." },
      { property: "og:title", content: "Sign in — Yesal Sa Khel" },
      { property: "og:description", content: "Create your free account and keep your reading streak everywhere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthScreen,
});

function AuthScreen() {
  const nav = useNavigate();
  const { profile } = useProfile();
  const { session, ready } = useSession();
  const lang = profile.language;

  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (ready && session) nav({ to: profile.onboarded ? "/app" : "/quiz", replace: true });
  }, [ready, session, profile.onboarded, nav]);

  async function withEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function withGoogle() {
    setBusy(true);
    setError(null);
    try {
      const auth = createLovableAuth();
      const result = await auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      if (result.tokens) {
        const { error } = await supabase.auth.setSession({
          access_token: result.tokens.access_token,
          refresh_token: result.tokens.refresh_token,
        });
        if (error) throw error;
      }
      nav({ to: profile.onboarded ? "/app" : "/quiz", replace: true });
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-screen-1 text-white" dir={isRtl(lang) ? "rtl" : "ltr"}>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-16 pt-10">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm text-white/70 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="mt-10">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-green font-display text-xl font-bold text-primary-foreground shadow-glow">Y</div>
          <h1 className="mt-6 font-display text-[2.1rem] font-black leading-[1.05] tracking-tight">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Keep your books, streak and language on every device.
          </p>
        </div>

        {sent ? (
          <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur">
            <Mail className="mx-auto h-7 w-7 text-[color:var(--gold)]" />
            <div className="mt-3 font-display text-lg font-bold">Check your email</div>
            <p className="mt-2 text-sm text-white/70">
              We sent a confirmation link to {email}. Tap it to activate your account.
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={withGoogle}
              disabled={busy}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-4 font-semibold text-background transition active:scale-[0.98] disabled:opacity-60"
            >
              <GoogleMark /> Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-white/45">
              <span className="h-px flex-1 bg-white/15" /> or <span className="h-px flex-1 bg-white/15" />
            </div>

            <form onSubmit={withEmail} className="flex flex-col gap-3">
              {mode === "signup" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-base text-white placeholder:text-white/45 backdrop-blur focus:border-white/60 focus:outline-none"
                />
              )}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-base text-white placeholder:text-white/45 backdrop-blur focus:border-white/60 focus:outline-none"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-base text-white placeholder:text-white/45 backdrop-blur focus:border-white/60 focus:outline-none"
              />

              {error && <div className="rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</div>}

              <button
                type="submit"
                disabled={busy}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-green px-6 py-4 text-lg font-bold text-primary-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signup" ? "Create free account" : "Sign in"}
              </button>
            </form>

            <button
              onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); }}
              className="mt-6 text-center text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.4 0 20.1 0 24s1 7.6 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.9l-7.5-5.8c-2.1 1.4-4.8 2.2-8.4 2.2-6.3 0-11.7-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
