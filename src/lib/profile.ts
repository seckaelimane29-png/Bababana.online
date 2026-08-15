import { useEffect, useState, useCallback } from "react";
import type { Language, Badge } from "./content";

export type IntakeAnswers = Record<string, string | string[] | number>;

export type Profile = {
  name: string;
  avatar: string;
  badge: Badge;
  country: string;
  language: Language;
  languageSet: boolean;
  motivation: string;
  goalMinutes: number;
  streak: number;
  lastReadDate: string | null;
  bookmarks: string[];
  readToday: string[];
  onboarded: boolean;
  intake: IntakeAnswers | null;
};

const KEY = "ysk:profile:v1";

const DEFAULT: Profile = {
  name: "Friend",
  avatar: "🦁",
  badge: "Wisdom Seeker",
  country: "🌍",
  language: "en",
  languageSet: false,
  motivation: "all",
  goalMinutes: 10,
  streak: 0,
  lastReadDate: null,
  bookmarks: [],
  readToday: [],
  onboarded: false,
  intake: null,
};

function read(): Profile {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

function write(p: Profile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("ysk:profile-change"));
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(read());
    setReady(true);
    const sync = () => setProfile(read());
    window.addEventListener("ysk:profile-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ysk:profile-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<Profile>) => {
    const next = { ...read(), ...patch };
    write(next);
    setProfile(next);
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    const cur = read();
    const bookmarks = cur.bookmarks.includes(id)
      ? cur.bookmarks.filter((b) => b !== id)
      : [...cur.bookmarks, id];
    write({ ...cur, bookmarks });
    setProfile({ ...cur, bookmarks });
  }, []);

  const markRead = useCallback((id: string) => {
    const cur = read();
    const today = new Date().toISOString().slice(0, 10);
    const readToday = cur.lastReadDate === today ? Array.from(new Set([...cur.readToday, id])) : [id];
    let streak = cur.streak;
    if (cur.lastReadDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      streak = cur.lastReadDate === yesterday ? cur.streak + 1 : 1;
    }
    const next = { ...cur, readToday, lastReadDate: today, streak };
    write(next);
    setProfile(next);
  }, []);

  return { profile, ready, update, toggleBookmark, markRead };
}