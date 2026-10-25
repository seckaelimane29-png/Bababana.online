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
  const cls = size === 'lg' ? 'text-2xl' : 'text-[15px]';
  if (course.prices.length === 0) return <span className={`${cls} font-semibold text-primary`}>{t.course.free}</span>;
  const [main, ...others] = sortPrices(course.prices, locale);
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={`${cls} font-semibold whitespace-nowrap text-ink tabular-nums`}>{formatMoney(main, locale)}</span>
      {others.length > 0 && (
        <span className="text-xs whitespace-nowrap text-subtle">+{others.map((p) => p.currency).join(', ')}</span>
      )}
    </span>
  );
}

/** Generated cover art (until creators upload real covers). Decorative, pure CSS. */
export function CourseCover({
  course,
  label,
  className = '',
  labelClassName = '',
}: {
  course: Course;
  label?: string;
  className?: string;
  labelClassName?: string;
}) {
  const h = course.coverHue;
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 85% 0%, hsl(${h} 45% 62% / 0.55), transparent 60%), linear-gradient(160deg, hsl(${h} 32% 40%), hsl(${(h + 18) % 360} 38% 24%))`,
      }}
    >
      {label && (
        <span className={`absolute bottom-3 left-3 rounded-pill bg-white/18 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md ${labelClassName}`}>
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

/** Compact row on phones (App Store style), card from tablet up. */
export function CourseCard({ course, locale, t, categories }: { course: CourseWithCreator; locale: Locale; t: Dictionary; categories: Category[] }) {
  const category = categories.find((c) => c.slug === course.categorySlug);
  return (
    <article className="card group relative flex gap-3.5 overflow-hidden p-3 transition-[box-shadow,transform] duration-300 ease-(--ease-out) hover:shadow-lift sm:flex-col sm:gap-0 sm:p-0 sm:hover:-translate-y-0.5">
      <CourseCover
        course={course}
        label={category?.name[locale]}
        className="size-[88px] shrink-0 rounded-[14px] sm:aspect-[16/10] sm:size-auto sm:rounded-none"
        labelClassName="hidden sm:inline-flex"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-2 sm:p-5">
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-subtle">
          <span>{t.languages[course.language]}</span>
          <span aria-hidden>·</span>
          <span>{t.levels[course.level]}</span>
          {course.isDemo && (
            <>
              <span aria-hidden>·</span>
              <DemoBadge label={t.demo.badge} />
            </>
          )}
        </p>
        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold tracking-[-0.01em] text-ink sm:text-lg">
          <Link href={`/${locale}/courses/${course.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {course.title}
          </Link>
        </h3>
        <p className="hidden text-sm text-muted sm:line-clamp-2">{course.subtitle}</p>
        <div className="mt-auto flex items-center justify-between gap-3 sm:pt-3">
          <span className="flex min-w-0 items-center gap-2 text-[13px] text-muted">
            <span className="hidden sm:inline-flex"><Avatar creator={course.creator} size={24} /></span>
            <span className="truncate">{course.creator.displayName}</span>
          </span>
          <PriceTag course={course} locale={locale} t={t} />
        </div>
      </div>
    </article>
  );
}

export function CourseGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">{children}</div>;
}

export function CourseGridSkeleton({ count = 6, label }: { count?: number; label: string }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <CourseGrid>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="card flex gap-3.5 overflow-hidden p-3 sm:flex-col sm:gap-0 sm:p-0">
            <div className="size-[88px] shrink-0 animate-pulse rounded-[14px] bg-sunk sm:aspect-[16/10] sm:size-auto sm:rounded-none" />
            <div className="flex-1 space-y-3 py-1 sm:p-5">
              <div className="h-3 w-1/3 animate-pulse rounded bg-sunk" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-sunk" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-sunk" />
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
        <h2 className="heading-display text-[26px] sm:text-[34px]">{title}</h2>
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
      <h2 className="text-xl font-semibold tracking-[-0.015em]">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function courseStats(course: Course) {
  return { sections: course.sections.length, lessons: lessonCount(course), minutes: totalMinutes(course) };
}
