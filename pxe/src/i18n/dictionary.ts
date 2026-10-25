import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from './config';
import type { Dictionary } from './dictionaries/en';

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./dictionaries/en').then((m) => m.en),
  fr: () => import('./dictionaries/fr').then((m) => m.fr),
};

export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return locale;
}

/** Server-only: resolves the current route's locale via next/root-params. */
export async function getDictionary(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: await dictionaries[locale]() };
}

export type { Dictionary };
