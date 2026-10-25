import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionary';
import type { Category, Course, CourseWithCreator, Creator } from '@/lib/catalog/types';
import { lessonCount, totalMinutes } from '@/lib/catalog/repository';
import { formatMoney, type Currency, type Money } from '@/lib/money';
import { DemoBadge } from './site-chrome';

/** Preferred display currency per UI locale, used only to order existing prices. */
const PREFERRED: Record<Locale, Currency[]> = { en: ['GMD', 'EUR', 'XOF'], fr: ['XOF', 'EUR', 'GMD'] };

export function sortPrices(prices: Money[], locale: Locale): Money[] {
  const order = PREFERRED[locale];
  return [...prices].sort((a, b) => order.indexOf(a.currency) - order.indexOf(b.currency));
}

export function PriceTag({ course, locale, t, size = 'md' }: { course: Course; locale: Locale; t: Dictionary; size?: 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'text-2xl' : 'text-base';
  if (course.prices.length === 0) return <span className={`${cls} font-semibold text-primary`}>{t.course.free}</span>;
  const [main, ...others] = sortPrices(course.prices, locale);
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={`${cls} font-semibold whitespace-nowrap text-ink`}>{formatMoney(main, locale)}</span>
      {others.length > 0 && (
        <span className="text-xs whitespace-nowrap text-subtle">+{others.map((p) => p.currency).join(', ')}</span>
      )}
    </span>
  );
}

/** Generated cover art (until creators upload real covers). Decorative only. */
export function CourseCover({ course, label, className = '' }: { course: Course; label?: string; className?: string }) {
  const h = course.coverHue;
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${h} 38% 34%), hsl(${(h + 28) % 360} 42% 20%))` }}
    >
      <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <circle cx="270" cy="20" r="90" fill="white" opacity="0.07" />
        <circle cx="300" cy="160" r="60" fill="white" opacity="0.06" />
        <path d="M0 150 Q80 110 160 140 T320 120 V180 H0Z" fill="black" opacity="0.12" />
        <g stroke="white" strokeOpacity="0.18" fill="none">
          <circle cx="60" cy="60" r="22" />
          <circle cx="60" cy="60" r="34" />
        </g>
      </svg>
      {label && (
        <span className="absolute bottom-3 left-3 rounded-pill bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}

function hashHue(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export function Avatar({ creator, size = 40 }: { creator: Pick<Creator, 'displayName' | 'username'>; size?: number }) {
  const initials = creator.displayName
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const h = hashHue(creator.username);
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${h} 32% 36%)` }}
    >
      {initials}
    </span>
  );
}

export function CourseCard({ course, locale, t, categories }: { course: CourseWithCreator; locale: Locale; t: Dictionary; categories: Category[] }) {
  const category = categories.find((c) => c.slug === course.categorySlug);
  return (
    <article className="card group relative flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-lift">
      <CourseCover course={course} label={category?.name[locale]} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="chip">{t.languages[course.language]}</span>
          <span className="chip">{t.levels[course.level]}</span>
          {course.isDemo && <DemoBadge label={t.demo.badge} />}
        </div>
        <h3 className="font-display text-lg leading-snug font-semibold text-ink">
          <Link href={`/${locale}/courses/${course.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {course.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted">{course.subtitle}</p>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
          <span className="flex min-w-0 items-center gap-2 text-sm text-muted">
            <Avatar creator={course.creator} size={26} />
            <span className="truncate">{course.creator.displayName}</span>
          </span>
          <PriceTag course={course} locale={locale} t={t} />
        </div>
      </div>
    </article>
  );
}

export function CourseGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export function CourseGridSkeleton({ count = 6, label }: { count?: number; label: string }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <CourseGrid>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-[16/9] animate-pulse bg-sunk" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-1/3 animate-pulse rounded bg-sunk" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-sunk" />
              <div className="h-3 w-full animate-pulse rounded bg-sunk" />
            </div>
          </div>
        ))}
      </CourseGrid>
    </div>
  );
}

export function SectionHeading({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="heading-display text-2xl sm:text-3xl">{title}</h2>
        {sub && <p className="mt-2 text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span aria-hidden className="mb-4 grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function courseStats(course: Course) {
  return { sections: course.sections.length, lessons: lessonCount(course), minutes: totalMinutes(course) };
}
