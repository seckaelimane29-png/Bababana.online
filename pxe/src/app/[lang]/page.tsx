import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionary';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionary';
import { getCatalog } from '@/lib/catalog/repository';
import { courses as exampleCourses, creators as exampleCreators } from '@/lib/catalog/demo-data';
import { Avatar, CourseCard, CourseCover, CourseGrid, PriceTag, SectionHeading } from '@/components/course-ui';
import { DemoBadge } from '@/components/site-chrome';

export default async function HomePage() {
  const { locale, t } = await getDictionary();
  const catalog = getCatalog();
  const [featured, instructors, categories] = await Promise.all([
    catalog.listFeaturedCourses(6),
    catalog.listFeaturedCreators(4),
    catalog.listCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="eyebrow">{t.home.eyebrow}</p>
            <h1 className="heading-display mt-3 text-[42px] leading-[1.03] sm:text-6xl lg:text-[76px] lg:tracking-[-0.035em]">{t.home.title}</h1>
            <p className="mt-6 max-w-xl text-[19px] leading-relaxed text-muted">{t.home.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${locale}/teach`} className="btn btn-primary min-h-12 px-7 text-base">
                {t.cta.startTeaching}
              </Link>
              <Link href={`/${locale}/courses`} className="btn btn-secondary min-h-12 px-7 text-base">
                {t.cta.exploreCourses}
              </Link>
            </div>
          </div>
          <StorefrontPreview locale={locale} t={t} />
        </div>
      </section>

      {/* Featured courses */}
      {featured.length > 0 && (
        <section className="container-page py-12">
          <SectionHeading
            title={t.home.featuredTitle}
            sub={t.home.featuredSub}
            action={<Link href={`/${locale}/courses`} className="link text-sm">{t.home.viewAll} →</Link>}
          />
          <CourseGrid>
            {featured.map((c) => (
              <CourseCard key={c.slug} course={c} locale={locale} t={t} categories={categories} />
            ))}
          </CourseGrid>
        </section>
      )}

      {/* Categories */}
      <section className="container-page py-12">
        <SectionHeading title={t.home.categoriesTitle} sub={t.home.categoriesSub} />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/${locale}/courses?category=${cat.slug}`}
                className="card flex min-h-16 items-center px-4 py-3 text-sm font-medium transition-[box-shadow,color] duration-300 hover:text-primary hover:shadow-lift"
              >
                {cat.name[locale]}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="mt-12 bg-primary py-20 text-on-primary">
        <div className="container-page">
          <h2 className="text-[34px] font-bold tracking-[-0.025em]">{t.home.how.title}</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {t.home.how.steps.map((step, i) => (
              <li key={step.title}>
                <span className="grid size-10 place-items-center rounded-full bg-white/12 text-lg font-semibold">{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm opacity-85">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-page grid gap-6 py-16 md:grid-cols-2">
        {[t.home.creators, t.home.students].map((block, i) => (
          <div key={block.title} className="card p-6 sm:p-8">
            <h2 className="heading-display text-2xl">{block.title}</h2>
            <ul className="mt-5 space-y-3">
              {block.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm">
                  <span aria-hidden className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs ${i === 0 ? 'bg-accent-soft text-accent' : 'bg-primary-soft text-primary'}`}>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Instructors */}
      {instructors.length > 0 && (
        <section className="container-page py-12">
          <SectionHeading title={t.home.instructorsTitle} sub={t.home.instructorsSub} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {instructors.map((cr) => (
              <li key={cr.username}>
                <Link href={`/${locale}/creator/${cr.username}`} className="card flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-lift">
                  <div className="flex items-center gap-3">
                    <Avatar creator={cr} size={48} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{cr.displayName}</p>
                      <p className="truncate text-xs text-subtle">{cr.location}</p>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted">{cr.headline}</p>
                  {cr.isDemo && <span className="mt-auto"><DemoBadge label={t.demo.badge} /></span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="heading-display text-center text-[34px]">{t.home.faq.title}</h2>
          <div className="card mt-8 divide-y divide-line">
            {t.home.faq.items.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span aria-hidden className="text-xl text-subtle transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page">
        <div className="card flex flex-col items-start justify-between gap-6 bg-primary-soft p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="heading-display text-2xl sm:text-3xl">{t.home.finalCta.title}</h2>
            <p className="mt-2 text-muted">{t.home.finalCta.body}</p>
          </div>
          <Link href={`/${locale}/teach`} className="btn btn-primary px-6 text-base">
            {t.cta.startTeaching}
          </Link>
        </div>
      </section>
    </>
  );
}

/** Illustration of a creator storefront, built from labeled example data. */
function StorefrontPreview({ locale, t }: { locale: Locale; t: Dictionary }) {
  const creator = exampleCreators[0];
  const items = exampleCourses.filter((c) => c.creatorUsername === creator.username).slice(0, 2);
  return (
    <figure className="relative mx-auto w-full max-w-md" aria-label={t.home.previewLabel}>
      <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary-soft via-transparent to-accent-soft opacity-80 blur-2xl" />
      <div className="card overflow-hidden rounded-[24px] shadow-lift">
        <div className="flex items-center gap-1.5 border-b border-line bg-sunk px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="ml-3 truncate rounded-md bg-surface px-2 py-0.5 text-[11px] text-subtle">pxe.app/creator/{creator.username}</span>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3">
            <Avatar creator={creator} size={52} />
            <div className="min-w-0">
              <p className="text-[17px] font-semibold tracking-[-0.01em]">{creator.displayName}</p>
              <p className="truncate text-xs text-muted">{creator.headline}</p>
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold text-subtle">
            {items.length} {t.home.previewCourses}
          </p>
          <ul className="mt-2 space-y-2.5">
            {items.map((c) => (
              <li key={c.slug} className="flex items-center gap-3 rounded-2xl bg-sunk/70 p-2">
                <CourseCover course={c} className="h-12 w-16 shrink-0 rounded-lg" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.title}</span>
                <PriceTag course={c} locale={locale} t={t} />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <DemoBadge label={t.home.previewLabel} variant="solid" />
            <span className="rounded-pill bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary">{t.home.previewShare}</span>
          </div>
        </div>
      </div>
    </figure>
  );
}
