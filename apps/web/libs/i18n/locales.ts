export const Locales = ['en', 'zh'] as const;

export type Locale = (typeof Locales)[number];

export const DefaultLocale: Locale = 'en';

export const LocaleLabels: Record<Locale, string> = {
	en: 'English',
	zh: '中文',
} as const;
