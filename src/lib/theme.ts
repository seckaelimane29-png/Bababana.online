import { useCallback, useEffect, useState } from "react";

export const THEMES = [
  { id: "night", label: "Yesal", hint: "Emerald into deep indigo", swatch: ["#0f6b46", "#123b63", "#C9A84C"] },
  { id: "sepia", label: "Sepia", hint: "Warm paper, easy on the eyes", swatch: ["#f4ead7", "#1c1207", "#8a5a1f"] },
  { id: "paper", label: "Paper", hint: "Clean and bright", swatch: ["#ffffff", "#111111", "#1f7a45"] },
  { id: "ink", label: "Ink", hint: "True black, OLED friendly", swatch: ["#000000", "#e8e8e8", "#C9A84C"] },
  { id: "sahel", label: "Sahel", hint: "Terracotta and sand", swatch: ["#1a0f0b", "#e8763a", "#e8c07a"] },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const KEY = "ysk:theme:v1";

export function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>("night");

  useEffect(() => {
    const stored = (window.localStorage.getItem(KEY) as ThemeId | null) ?? "night";
    setTheme(stored);
    applyTheme(stored);
    const sync = () => {
      const next = (window.localStorage.getItem(KEY) as ThemeId | null) ?? "night";
      setTheme(next);
      applyTheme(next);
    };
    window.addEventListener("ysk:theme-change", sync);
    return () => window.removeEventListener("ysk:theme-change", sync);
  }, []);

  const change = useCallback((id: ThemeId) => {
    window.localStorage.setItem(KEY, id);
    applyTheme(id);
    setTheme(id);
    window.dispatchEvent(new CustomEvent("ysk:theme-change"));
  }, []);

  return { theme, setTheme: change };
}

export const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem('${KEY}')||'night';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
