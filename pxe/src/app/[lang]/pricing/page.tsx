import type { Metadata } from 'next';
import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionary';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.nav.pricing, description: t.pricing.subtitle };
}

export default async function PricingPage() {
  const { locale, t } = await getDictionary();
  return (
    <div className="container-page py-14">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="heading-display text-4xl">{t.pricing.title}</h1>
        <p className="mt-4 text-muted">{t.pricing.subtitle}</p>
      </header>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        {t.pricing.plans.map((plan) => (
          <section
            key={plan.name}
            className={`card flex flex-col p-7 ${plan.highlighted ? 'ring-2 ring-primary' : ''}`}
            aria-labelledby={`plan-${plan.name}`}
          >
            <h2 id={`plan-${plan.name}`} className="text-2xl font-bold tracking-[-0.02em]">{plan.name}</h2>
            <p className="mt-1 text-sm text-muted">{plan.blurb}</p>
            <p className="mt-6 text-3xl font-semibold">
              {plan.price ?? <span className="text-xl text-subtle">{t.pricing.tbd}</span>}
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <span aria-hidden className="text-primary">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/teach`} className={`btn mt-8 ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}>
              {t.cta.startTeaching}
            </Link>
          </section>
        ))}
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-3">
        {[
          [t.pricing.feesTitle, t.pricing.feesBody],
          [t.pricing.paymentsTitle, t.pricing.paymentsBody],
          [t.pricing.payoutsTitle, t.pricing.payoutsBody],
        ].map(([title, body]) => (
          <section key={title} className="rounded-card bg-sunk p-6">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
