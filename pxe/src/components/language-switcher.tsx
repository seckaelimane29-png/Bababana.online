'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/config';

/** Swaps the locale prefix of the current path, keeping the rest of the URL. */
export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() ?? `/${current}`;
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
  return (
    <nav aria-label={label} className="flex items-center gap-1 rounded-pill border border-line bg-surface p-0.5 text-xs font-semibold">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}${rest}`}
          hrefLang={locale}
          lang={locale}
          aria-current={locale === current ? 'true' : undefined}
          title={LOCALE_LABELS[locale]}
          className={
            locale === current
              ? 'rounded-pill bg-primary px-2.5 py-1 text-on-primary'
              : 'rounded-pill px-2.5 py-1 text-muted hover:text-ink'
          }
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
