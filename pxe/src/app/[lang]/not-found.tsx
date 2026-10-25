import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionary';

export default async function NotFound() {
  const { locale, t } = await getDictionary();
  return (
    <section className="container-page py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="heading-display mt-3 text-3xl">{t.common.notFoundTitle}</h1>
      <p className="mt-3 text-muted">{t.common.notFoundBody}</p>
      <Link href={`/${locale}`} className="btn btn-primary mt-8">
        {t.common.backHome}
      </Link>
    </section>
  );
}
