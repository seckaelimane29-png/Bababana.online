import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getDictionary } from '@/i18n/dictionary';
import { getCatalog } from '@/lib/catalog/repository';
import { parseFilters } from '@/lib/catalog/filter';
import { COURSE_LANGUAGES, COURSE_LEVELS, type CourseFilters } from '@/lib/catalog/types';
import { CURRENCIES } from '@/lib/money';
import { CourseCard, CourseGrid, CourseGridSkeleton, EmptyState } from '@/components/course-ui';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.market.title, description: t.market.subtitle };
}

export default async function CoursesPage({ searchParams }: PageProps<'/[lang]/courses'>) {
  const { t } = await getDictionary();
  return (
    <div className="container-page py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="heading-display text-[34px] sm:text-5xl">{t.market.title}</h1>
        <p className="mt-2 text-muted">{t.market.subtitle}</p>
      </header>
      <Suspense fallback={<CourseGridSkeleton label={t.market.loading} />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<'/[lang]/courses'>['searchParams'] }) {
  const { locale, t } = await getDictionary();
  const filters = parseFilters(await searchParams);
  const catalog = getCatalog();
  const [categories, courses, anyCourses] = await Promise.all([
    catalog.listCategories(),
    catalog.searchCourses(filters),
    catalog.listAllCourseSlugs().then((s) => s.length > 0),
  ]);
  const active = Object.values(filters).some(Boolean);

  /** Same filters with some values replaced — keeps chip links shareable. */
  function hrefWith(patch: Partial<CourseFilters>) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filters, ...patch })) if (v) params.set(k, String(v));
    const qs = params.toString();
    return `/${locale}/courses${qs ? `?${qs}` : ''}`;
  }

  return (
    <>
      <nav aria-label={t.market.category} className="scroller mb-4">
        {[{ slug: undefined, label: t.market.allCategories }, ...categories.map((c) => ({ slug: c.slug, label: c.name[locale] }))].map(
          ({ slug, label }) => (
            <Link
              key={slug ?? 'all'}
              href={hrefWith({ category: slug })}
              aria-current={filters.category === slug ? 'page' : undefined}
              className="pill-link"
            >
              {label}
            </Link>
          ),
        )}
      </nav>
      <FilterForm filters={filters} categories={categories} />
      <div className="mb-4 flex items-center justify-between text-sm text-muted" aria-live="polite">
        <span>{t.market.results(courses.length)}</span>
        {active && (
          <Link href={`/${locale}/courses`} className="link">
            {t.market.reset}
          </Link>
        )}
      </div>
      {courses.length > 0 ? (
        <CourseGrid>
          {courses.map((c) => (
            <CourseCard key={c.slug} course={c} locale={locale} t={t} categories={categories} />
          ))}
        </CourseGrid>
      ) : anyCourses ? (
        <EmptyState
          title={t.market.emptyTitle}
          body={t.market.emptyBody}
          action={<Link href={`/${locale}/courses`} className="btn btn-secondary">{t.market.reset}</Link>}
        />
      ) : (
        <EmptyState title={t.market.noCatalogTitle} body={t.market.noCatalogBody} />
      )}
    </>
  );

  /** Plain GET form: works without JavaScript and keeps filters in the URL (shareable). */
  function FilterForm({ filters, categories }: { filters: CourseFilters; categories: Awaited<ReturnType<typeof catalog.listCategories>> }) {
    const select = (name: string, label: string, value: string | undefined, options: [string, string][], any: string) => (
      <div>
        <label htmlFor={`f-${name}`} className="field-label">{label}</label>
        <select id={`f-${name}`} name={name} defaultValue={value ?? ''} className="field">
          <option value="">{any}</option>
          {options.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
    );
    return (
      <form action={`/${locale}/courses`} method="get" role="search" className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="f-q" className="sr-only">{t.market.search}</label>
            <input id="f-q" name="q" type="search" defaultValue={filters.q ?? ''} placeholder={t.market.searchPlaceholder} className="field" maxLength={100} />
          </div>
          <button type="submit" className="btn btn-primary">{t.market.search}</button>
        </div>
        <details className="mt-3" open={active || undefined}>
          <summary className="cursor-pointer text-sm font-medium text-muted select-none">{t.market.filters}</summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {select('category', t.market.category, filters.category, categories.map((c) => [c.slug, c.name[locale]]), t.market.allCategories)}
            {select('language', t.market.language, filters.language, COURSE_LANGUAGES.map((l) => [l, t.languages[l]]), t.market.anyLanguage)}
            {select('level', t.market.level, filters.level, COURSE_LEVELS.map((l) => [l, t.levels[l]]), t.market.anyLevel)}
            {select('price', t.market.price, filters.price, [['free', t.market.free], ['paid', t.market.paid]], t.market.anyPrice)}
            {select('currency', t.market.currency, filters.currency, Object.keys(CURRENCIES).map((c) => [c, c]), t.market.anyCurrency)}
          </div>
          <button type="submit" className="btn btn-secondary mt-4">{t.market.apply}</button>
        </details>
      </form>
    );
  }
}
