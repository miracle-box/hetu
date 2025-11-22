import { type Locale, Locales } from '../i18n/locales';

export function isSupportedLocale(locale: string): locale is Locale {
	return Locales.includes(locale as Locale);
}

/**
 * Match supported locale from browser language.
 */
export function matchLocaleFromBrowserLang(browserLang: string): Locale | null {
	const lowerLang = browserLang.toLowerCase();

	for (const locale of Locales) {
		if (lowerLang === locale || lowerLang.startsWith(`${locale}-`)) {
			return locale;
		}
	}

	return null;
}
