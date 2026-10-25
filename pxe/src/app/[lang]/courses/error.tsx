'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

// Client boundary: dictionaries are server-only, so keep a tiny local copy.
const copy = {
  en: { title: 'We couldn’t load courses', body: 'Please check your connection and try again.', retry: 'Try again' },
  fr: { title: 'Impossible de charger les formations', body: 'Vérifiez votre connexion et réessayez.', retry: 'Réessayer' },
};

export default function CoursesError({ error, retry }: { error: unknown; retry: () => void }) {
  const { lang } = useParams<{ lang: string }>();
  const t = lang === 'fr' ? copy.fr : copy.en;
  useEffect(() => console.error(error), [error]);
  return (
    <div role="alert" className="container-page py-20 text-center">
      <h1 className="heading-display text-2xl">{t.title}</h1>
      <p className="mt-2 text-muted">{t.body}</p>
      <button type="button" onClick={() => retry()} className="btn btn-primary mt-6">
        {t.retry}
      </button>
    </div>
  );
}
