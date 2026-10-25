import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getDictionary } from '@/i18n/dictionary';
import type { Dictionary } from '@/i18n/dictionary';

type DocKey = keyof Dictionary['legal']['docs'];
const DOCS: DocKey[] = ['terms', 'privacy', 'refunds'];
const isDoc = (v: string): v is DocKey => (DOCS as string[]).includes(v);

export async function generateStaticParams() {
  return DOCS.map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: PageProps<'/[lang]/legal/[doc]'>): Promise<Metadata> {
  const { doc } = await params;
  const { t } = await getDictionary();
  return isDoc(doc) ? { title: t.legal.docs[doc].title, robots: { index: false } } : {};
}

export default function LegalPage({ params }: PageProps<'/[lang]/legal/[doc]'>) {
  return (
    <Suspense fallback={<div className="container-page h-96" aria-busy="true" />}>
      <LegalDoc params={params} />
    </Suspense>
  );
}

async function LegalDoc({ params }: Pick<PageProps<'/[lang]/legal/[doc]'>, 'params'>) {
  const { doc } = await params;
  if (!isDoc(doc)) notFound();
  const { t } = await getDictionary();
  const content = t.legal.docs[doc];
  return (
    <article className="container-page max-w-3xl py-14">
      <h1 className="heading-display text-4xl">{content.title}</h1>
      <p role="note" className="mt-6 rounded-xl border border-highlight bg-highlight-soft px-4 py-3 text-sm">{t.legal.draft}</p>
      <div className="mt-10 space-y-8">
        {content.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
