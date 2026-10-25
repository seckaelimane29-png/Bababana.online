import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getDictionary } from '@/i18n/dictionary';
import { atLeastOne, getCatalog } from '@/lib/catalog/repository';
import type { SocialLinks } from '@/lib/catalog/types';
import { Avatar, CourseCard, CourseGrid, EmptyState } from '@/components/course-ui';
import { CopyLink } from '@/components/copy-link';
import { DemoBadge } from '@/components/site-chrome';

export async function generateStaticParams() {
  return atLeastOne(await getCatalog().listAllCreatorUsernames()).map((username) => ({ username }));
}

export async function generateMetadata({ params }: PageProps<'/[lang]/creator/[username]'>): Promise<Metadata> {
  const { username } = await params;
  const creator = await getCatalog().getCreator(username);
  return creator ? { title: creator.displayName, description: creator.headline } : {};
}

export default function CreatorPage({ params }: PageProps<'/[lang]/creator/[username]'>) {
  return (
    <Suspense fallback={<div className="container-page h-96 py-14" aria-busy="true" />}>
      <Storefront params={params} />
    </Suspense>
  );
}

const SOCIAL_LABELS: Record<keyof SocialLinks, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  website: 'Website',
};

async function Storefront({ params }: Pick<PageProps<'/[lang]/creator/[username]'>, 'params'>) {
  const { username } = await params;
  const { locale, t } = await getDictionary();
  const catalog = getCatalog();
  const creator = await catalog.getCreator(username);
  if (!creator) notFound();
  const [courses, categories] = await Promise.all([catalog.listCoursesByCreator(username), catalog.listCategories()]);
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof SocialLinks)[]).filter((k) => creator.socials[k]);

  return (
    <>
      <section className="relative border-b border-line">
        <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-primary to-primary-hover sm:h-40" />
        <div className="container-page relative pt-16 pb-10 sm:pt-24">
          <div className="card p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="-mt-16 w-fit rounded-full border-4 border-surface sm:-mt-20">
                <Avatar creator={creator} size={104} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="heading-display text-3xl">{creator.displayName}</h1>
                  {creator.isVerified && <span className="chip border-primary text-primary">✓ {t.creator.verified}</span>}
                  {creator.isDemo && <DemoBadge label={t.demo.badge} />}
                </div>
                <p className="mt-1 text-muted">{creator.headline}</p>
                <p className="mt-1 text-sm text-subtle">{t.creator.based} {creator.location}</p>
                <p className="mt-5 max-w-3xl leading-relaxed">{creator.bio}</p>
                <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold text-subtle">{t.creator.expertise}</dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">{creator.expertise.map((e) => <span key={e} className="chip">{e}</span>)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-subtle">{t.creator.teachesIn}</dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">{creator.languages.map((l) => <span key={l} className="chip">{t.languages[l]}</span>)}</dd>
                  </div>
                </dl>
                {socials.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {socials.map((k) => (
                      <li key={k}>
                        <a href={creator.socials[k]} rel="noopener noreferrer nofollow" target="_blank" className="btn btn-secondary min-h-9 px-4 text-xs">
                          {SOCIAL_LABELS[k]}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="w-full sm:w-72">
                <p className="text-sm font-semibold">{t.creator.shareTitle}</p>
                <p className="mt-1 mb-3 text-xs text-muted">{t.creator.shareHint}</p>
                <CopyLink path={`/${locale}/creator/${creator.username}`} copyLabel={t.creator.copy} copiedLabel={t.creator.copied} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <h2 className="heading-display mb-6 text-2xl">
          {t.creator.courses} <span className="text-base font-normal text-subtle">({courses.length})</span>
        </h2>
        {courses.length > 0 ? (
          <CourseGrid>
            {courses.map((c) => (
              <CourseCard key={c.slug} course={c} locale={locale} t={t} categories={categories} />
            ))}
          </CourseGrid>
        ) : (
          <EmptyState title={t.creator.noCourses} body="" />
        )}
      </section>
    </>
  );
}
