import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getDictionary } from '@/i18n/dictionary';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionary';
import { atLeastOne, getCatalog } from '@/lib/catalog/repository';
import type { CourseWithCreator } from '@/lib/catalog/types';
import { formatMoney } from '@/lib/money';
import { Avatar, CourseCard, CourseCover, CourseGrid, courseStats, sortPrices } from '@/components/course-ui';
import { DemoBadge } from '@/components/site-chrome';

export async function generateStaticParams() {
  return atLeastOne(await getCatalog().listAllCourseSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/[lang]/courses/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCatalog().getCourse(slug);
  return course ? { title: course.title, description: course.subtitle } : {};
}

export default function CoursePage({ params }: PageProps<'/[lang]/courses/[slug]'>) {
  return (
    <Suspense fallback={<div className="container-page h-96 py-14" aria-busy="true" />}>
      <CourseDetails params={params} />
    </Suspense>
  );
}

async function CourseDetails({ params }: Pick<PageProps<'/[lang]/courses/[slug]'>, 'params'>) {
  const { slug } = await params;
  const { locale, t } = await getDictionary();
  const catalog = getCatalog();
  const course = await catalog.getCourse(slug);
  if (!course) notFound();
  const [categories, related] = await Promise.all([catalog.listCategories(), catalog.listRelatedCourses(slug, 3)]);
  const category = categories.find((c) => c.slug === course.categorySlug);
  const stats = courseStats(course);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-page grid grid-cols-1 gap-8 py-10 lg:grid-cols-[1fr_380px] lg:py-14">
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Link href={`/${locale}/courses`} className="hover:text-ink">{t.nav.explore}</Link>
              {category && (
                <>
                  <span aria-hidden>/</span>
                  <Link href={`/${locale}/courses?category=${category.slug}`} className="hover:text-ink">{category.name[locale]}</Link>
                </>
              )}
            </nav>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{t.languages[course.language]}</span>
              <span className="chip">{t.levels[course.level]}</span>
              {course.isDemo && <DemoBadge label={t.demo.badge} />}
            </div>
            <h1 className="heading-display mt-4 text-3xl leading-tight sm:text-4xl">{course.title}</h1>
            <p className="mt-3 text-lg text-muted">{course.subtitle}</p>
            <Link href={`/${locale}/creator/${course.creator.username}`} className="mt-6 inline-flex items-center gap-3 rounded-pill pr-3 hover:bg-sunk">
              <Avatar creator={course.creator} size={40} />
              <span className="text-sm">
                <span className="text-muted">{t.course.by} </span>
                <span className="font-semibold">{course.creator.displayName}</span>
              </span>
            </Link>
          </div>
          <PurchaseCard course={course} locale={locale} t={t} />
        </div>
      </section>

      <div className="container-page grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-12">
          {course.outcomes.length > 0 && (
            <section className="card p-6">
              <h2 className="heading-display text-xl">{t.course.outcomes}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((o) => (
                  <li key={o} className="flex gap-2.5 text-sm">
                    <span aria-hidden className="text-primary">✓</span>
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="heading-display text-2xl">{t.course.curriculum}</h2>
            <p className="mt-1 text-sm text-muted">{t.course.curriculumSummary(stats.sections, stats.lessons, stats.minutes)}</p>
            <div className="mt-5 space-y-3">
              {course.sections.map((section, si) => (
                <details key={section.title} open={si === 0 || undefined} className="card group overflow-hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                    <span>{section.title}</span>
                    <span className="text-xs font-normal text-subtle">{section.lessons.length} · <span aria-hidden className="inline-block transition-transform group-open:rotate-180">⌄</span></span>
                  </summary>
                  <ol className="divide-y divide-line border-t border-line">
                    {section.lessons.map((lesson) => (
                      <li key={lesson.title} className="flex items-center gap-3 px-5 py-3 text-sm">
                        <span aria-hidden className={lesson.isPreview ? 'text-primary' : 'text-subtle'}>{lesson.isPreview ? '▶' : '🔒︎'}</span>
                        <span className="min-w-0 flex-1">{lesson.title}</span>
                        {lesson.isPreview ? (
                          <span className="rounded-pill bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">{t.course.preview}</span>
                        ) : (
                          <span className="sr-only">{t.course.locked}</span>
                        )}
                        <span className="w-14 text-right text-xs text-subtle tabular-nums">{t.course.minutes(lesson.durationMinutes)}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="heading-display text-2xl">{t.course.about}</h2>
            <p className="mt-4 leading-relaxed whitespace-pre-line text-ink/90">{course.description}</p>
          </section>

          <section>
            <h2 className="heading-display text-2xl">{t.course.requirements}</h2>
            {course.requirements.length > 0 ? (
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm">
                {course.requirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">{t.course.noRequirements}</p>
            )}
          </section>

          <section className="card p-6">
            <h2 className="heading-display text-xl">{t.course.instructor}</h2>
            <div className="mt-4 flex items-start gap-4">
              <Avatar creator={course.creator} size={56} />
              <div className="min-w-0">
                <p className="font-semibold">{course.creator.displayName}</p>
                <p className="text-sm text-muted">{course.creator.headline}</p>
                <p className="mt-3 text-sm leading-relaxed">{course.creator.bio}</p>
                <Link href={`/${locale}/creator/${course.creator.username}`} className="link mt-3 inline-block text-sm">
                  {t.course.viewStorefront} →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page pb-4">
          <h2 className="heading-display mb-6 text-2xl">{t.course.related}</h2>
          <CourseGrid>
            {related.map((c) => (
              <CourseCard key={c.slug} course={c} locale={locale} t={t} categories={categories} />
            ))}
          </CourseGrid>
        </section>
      )}
    </>
  );
}

function PurchaseCard({ course, locale, t }: { course: CourseWithCreator; locale: Locale; t: Dictionary }) {
  const prices = sortPrices(course.prices, locale);
  const isFree = prices.length === 0;
  return (
    <aside className="card h-fit overflow-hidden lg:sticky lg:top-24">
      <CourseCover course={course} className="aspect-[16/9]" />
      <div className="space-y-5 p-5">
        <div>
          <p className="text-xs font-semibold text-subtle">{t.course.price}</p>
          {isFree ? (
            <p className="mt-1 text-3xl font-semibold text-primary">{t.course.free}</p>
          ) : (
            <>
              <p className="mt-1 text-3xl font-semibold">{formatMoney(prices[0], locale)}</p>
              {prices.length > 1 && (
                <p className="mt-1 text-sm text-muted">
                  {t.course.alsoAvailableIn}: {prices.slice(1).map((p) => formatMoney(p, locale)).join(' · ')}
                </p>
              )}
            </>
          )}
        </div>

        {/* Enrollment stays closed until a payment adapter in lib/payments is implemented and verified (stage 4). */}
        <div>
          <button type="button" disabled className="btn btn-primary w-full">
            {isFree ? t.course.enrollFree : t.course.enrollClosed}
          </button>
          <p className="mt-2 text-xs text-muted">{isFree ? t.course.enrollFreeSoon : t.course.enrollClosedBody}</p>
        </div>

        <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
          <div>
            <dt className="text-xs text-subtle">{t.course.language}</dt>
            <dd className="font-medium">{t.languages[course.language]}</dd>
          </div>
          <div>
            <dt className="text-xs text-subtle">{t.course.level}</dt>
            <dd className="font-medium">{t.levels[course.level]}</dd>
          </div>
        </dl>

        <div className="border-t border-line pt-4">
          <p className="text-sm font-semibold">{t.course.policyTitle}</p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted">
            {t.course.policy.map((p) => <li key={p}>• {p}</li>)}
          </ul>
          <Link href={`/${locale}/legal/refunds`} className="link mt-2 inline-block text-xs">{t.course.refundLink}</Link>
        </div>
      </div>
    </aside>
  );
}
