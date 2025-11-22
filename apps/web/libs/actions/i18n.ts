'use server';

import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { DefaultLocale, type Locale } from '../i18n/locales';
import { isSupportedLocale, matchLocaleFromBrowserLang } from '../utils/i18n';

const LocaleCookieName = 'locale';

/**
 * Parse `Accept-Language` from headers
 */
function parseAcceptLanguage(acceptLanguage: string | null): Locale {
	if (!acceptLanguage) return DefaultLocale;

	const languages = acceptLanguage
		.split(',')
		.map((lang) => {
			const [locale, q = '1'] = lang.trim().split(';q=');
			return { locale: (locale ?? '').toLowerCase(), quality: parseFloat(q) };
		})
		.sort((a, b) => b.quality - a.quality);

	for (const { locale } of languages) {
		const matchedLocale = matchLocaleFromBrowserLang(locale);
		if (matchedLocale) {
			return matchedLocale;
		}
	}

	return DefaultLocale;
}

/**
 * Find the locale to use (locale cookie > Accept-Language).
 */
export const getLocale = cache(async (): Promise<Locale> => {
	const cookieStore = await cookies();
	const locale = cookieStore.get(LocaleCookieName)?.value;

	if (locale && isSupportedLocale(locale)) {
		return locale;
	}

	const headersList = await headers();
	const acceptLanguage = headersList.get('accept-language');
	return parseAcceptLanguage(acceptLanguage);
});

/**
 * Set locale to cookie
 */
export async function setLocale(locale: Locale) {
	const cookieStore = await cookies();

	cookieStore.set(LocaleCookieName, locale, {
		httpOnly: false,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 365, // 1 year
	});
}
