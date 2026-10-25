import type { Metadata } from 'next';
import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionary';
import { supportEmail } from '@/lib/config';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.teach.title, description: t.teach.subtitle };
}

export default async function TeachPage() {
  const { locale, t } = await getDictionary();
  const email = supportEmail();
  return (
    <div className="container-page py-14">
      <header className="max-w-3xl">
        <h1 className="heading-display text-4xl sm:text-5xl">{t.teach.title}</h1>
        <p className="mt-4 text-lg text-muted">{t.teach.subtitle}</p>
      </header>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="card p-7">
          <h2 className="heading-display text-2xl">{t.teach.whoTitle}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {t.teach.who.map((w) => (
              <li key={w} className="flex gap-3">
                <span aria-hidden className="text-accent">●</span>
                {w}
              </li>
            ))}
          </ul>
        </section>

        <section className="card border-highlight bg-highlight-soft p-7">
          <h2 className="heading-display text-2xl">{t.teach.statusTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed">{t.teach.statusBody}</p>
          {email && (
            <p className="mt-5 text-sm">
              {t.teach.contact}{' '}
              <a href={`mailto:${email}`} className="link">{email}</a>
            </p>
          )}
          <p className="mt-5 text-xs text-muted">{t.teach.policyNote}</p>
        </section>
      </div>

      <section className="mt-14">
        <h2 className="heading-display text-2xl">{t.home.how.title}</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {t.home.how.steps.map((step, i) => (
            <li key={step.title} className="card p-6">
              <span className="font-display text-3xl text-primary">{i + 1}</span>
              <h3 className="mt-2 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href={`/${locale}/pricing`} className="btn btn-primary">{t.nav.pricing}</Link>
        <Link href={`/${locale}/courses`} className="btn btn-secondary">{t.cta.exploreCourses}</Link>
      </div>
    </div>
  );
}
