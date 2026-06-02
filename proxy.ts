import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { locales, defaultLocale } from './lib/dictionaries';

function getLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }
  
  const headers = { 'accept-language': request.headers.get('accept-language') || '' };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, locales, defaultLocale);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return;
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}${request.nextUrl.search}`, request.url);
    const response = NextResponse.redirect(newUrl);
    response.cookies.set('NEXT_LOCALE', locale);
    return response;
  }

  const pathLocale = pathname.split('/')[1];
  if (locales.includes(pathLocale as any)) {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    if (cookieLocale !== pathLocale) {
      const response = NextResponse.next();
      response.cookies.set('NEXT_LOCALE', pathLocale);
      return response;
    }
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!api|_next/static|_next/image|favicon.ico|logos|demos|wasm|workers|.*\\.).*)',
  ],
};
