import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LANGUAGES, type Language } from "@/lib/content";
import { useProfile } from "@/lib/profile";
import { t, isRtl } from "@/lib/i18n";
import { useUiTranslation } from "@/lib/useAutoTranslate";
import { Check, Globe } from "lucide-react";

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Choose your language — Yesal Sa Khel" },
      { name: "description", content: "Pick English, French, Italian, Spanish, Arabic or Portuguese — the whole app, quiz and every book follows your language." },
      { property: "og:title", content: "Choose your language — Yesal Sa Khel" },
      { property: "og:description", content: "The whole app, quiz and every book in your language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LanguagePicker,
});

function LanguagePicker() {
  const nav = useNavigate();
  const { profile, update } = useProfile();
  const [lang, setLang] = useState<Language>(profile.language);
  useUiTranslation(lang);

  function confirm() {
    update({ language: lang, languageSet: true });
    nav({ to: profile.onboarded ? "/app" : "/" });
  }

  return (
    <div className="min-h-screen bg-screen-1" dir={isRtl(lang) ? "rtl" : "ltr"}>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-40 pt-16 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur">
          <Globe className="h-6 w-6 text-white" />
        </div>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">{t(lang, "lang.kicker")}</p>
        <h1 className="mt-4 font-display text-[2.35rem] font-black leading-[1.05] tracking-tight text-white">{t(lang, "lang.title")}</h1>
        <p className="mx-auto mt-4 max-w-xs text-base leading-relaxed text-white/75">{t(lang, "lang.sub")}</p>

        <div className="mt-10 flex flex-col gap-3 text-start">
          {LANGUAGES.map((l) => {
            const selected = lang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-base font-medium backdrop-blur transition ${selected ? "border-white bg-white/25 text-white" : "border-white/20 bg-white/10 text-white/85"}`}
              >
                <span className="flex items-center gap-3"><span className="text-2xl">{l.flag}</span>{l.label}</span>
                {selected && <Check className="h-5 w-5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 px-6 pb-8 pt-14 [background:linear-gradient(to_top,oklch(0.2_0.05_265/0.75),transparent)]">
        <button
          onClick={confirm}
          className="pointer-events-auto mx-auto block w-full max-w-md rounded-full bg-white px-6 py-5 text-lg font-bold text-background shadow-elevated transition active:scale-[0.98]"
        >
          {t(lang, "lang.cta")}
        </button>
      </div>
    </div>
  );
}
