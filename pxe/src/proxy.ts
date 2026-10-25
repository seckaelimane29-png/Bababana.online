import { NextResponse, type NextRequest } from 'next/server';
import { LOCALES, negotiateLocale } from '@/i18n/config';

/** Redirect un-prefixed paths (e.g. /creator/fatou) to the visitor's locale. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPrefix = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasPrefix) return;

  const locale = negotiateLocale(request.headers.get('accept-language'));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and files with an extension (favicon, images, …).
  matcher: ['/((?!_next|.*\\.[\\w]+$).*)'],
};
