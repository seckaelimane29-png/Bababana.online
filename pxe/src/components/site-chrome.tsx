import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionary';
import { LanguageSwitcher } from './language-switcher';

export function Logo({ locale }: { locale: Locale }) {
  return (
    <Link href={`/${locale}`} className="flex items-center gap-2" aria-label="PXE">
      <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-on-primary">
        P
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-ink">PXE</span>
    </Link>
  );
}

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = [
    { href: `/${locale}/courses`, label: t.nav.explore },
    { href: `/${locale}/teach`, label: t.nav.teach },
    { href: `/${locale}/pricing`, label: t.nav.pricing },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur supports-[backdrop-filter]:bg-canvas/75">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        {t.nav.skip}
      </a>
      <div className="container-page flex h-16 items-center gap-4">
        <Logo locale={locale} />
        <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-sunk hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher current={locale} label={t.nav.language} />
          <Link href={`/${locale}/teach`} className="btn btn-primary hidden sm:inline-flex">
            {t.cta.startTeaching}
          </Link>
          {/* No-JS mobile menu */}
          <details className="group relative md:hidden">
            <summary className="btn btn-ghost list-none px-3 [&::-webkit-details-marker]:hidden" aria-label={t.nav.menu}>
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            </summary>
            <div className="card absolute right-0 mt-2 w-64 p-2">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-sunk">
                  {l.label}
                </Link>
              ))}
              <Link href={`/${locale}/teach`} className="btn btn-primary mt-2 w-full">
                {t.cta.startTeaching}
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ locale, t, supportEmail }: { locale: Locale; t: Dictionary; supportEmail: string | null }) {
  const col = 'space-y-2 text-sm';
  const a = 'text-muted hover:text-ink';
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo locale={locale} />
          <p className="max-w-xs text-sm text-muted">{t.footer.tagline}</p>
          <p className="text-xs text-subtle">{t.footer.markets}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.footer.platform}</h2>
          <ul className={col}>
            <li><Link className={a} href={`/${locale}/courses`}>{t.nav.explore}</Link></li>
            <li><Link className={a} href={`/${locale}/teach`}>{t.nav.teach}</Link></li>
            <li><Link className={a} href={`/${locale}/pricing`}>{t.nav.pricing}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">{t.footer.legal}</h2>
          <ul className={col}>
            <li><Link className={a} href={`/${locale}/legal/terms`}>{t.footer.terms}</Link></li>
            <li><Link className={a} href={`/${locale}/legal/privacy`}>{t.footer.privacy}</Link></li>
            <li><Link className={a} href={`/${locale}/legal/refunds`}>{t.footer.refunds}</Link></li>
          </ul>
        </div>
        {supportEmail && (
          <div>
            <h2 className="mb-3 text-sm font-semibold">{t.footer.support}</h2>
            <ul className={col}>
              <li><a className={a} href={`mailto:${supportEmail}`}>{t.footer.contact}</a></li>
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-line">
        <p className="container-page py-5 text-xs text-subtle">© PXE. {t.footer.rights}</p>
      </div>
    </footer>
  );
}

export function DemoBanner({ t }: { t: Dictionary }) {
  return (
    <div role="note" className="border-b border-line bg-highlight-soft">
      <p className="container-page flex items-center gap-2 py-2 text-xs text-ink">
        <DemoBadge label={t.demo.badge} />
        <span>{t.demo.banner}</span>
      </p>
    </div>
  );
}

export function DemoBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-pill bg-highlight px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase" style={{ color: '#1e1e1c' }}>
      {label}
    </span>
  );
}
