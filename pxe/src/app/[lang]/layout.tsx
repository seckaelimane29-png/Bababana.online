import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { LOCALES } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionary';
import { getCatalog } from '@/lib/catalog/repository';
import { supportEmail } from '@/lib/config';
import { DemoBanner, SiteFooter, SiteHeader } from '@/components/site-chrome';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap', axes: ['opsz'] });

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: { default: t.meta.title, template: `%s · ${t.meta.siteName}` },
    description: t.meta.description,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])) },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f0' },
    { media: '(prefers-color-scheme: dark)', color: '#121512' },
  ],
};

export default async function RootLayout({ children }: LayoutProps<'/[lang]'>) {
  const { locale, t } = await getDictionary();
  const { isDemo } = getCatalog();
  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col">
        {isDemo && <DemoBanner t={t} />}
        <SiteHeader locale={locale} t={t} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} t={t} supportEmail={supportEmail()} />
      </body>
    </html>
  );
}
