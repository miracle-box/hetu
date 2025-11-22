import { getRequestConfig } from 'next-intl/server';
import { getLocale } from '../actions/i18n';

export default getRequestConfig(async () => {
	const locale = await getLocale();

	return {
		locale,
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		messages: (await import(`./messages/${locale}.json`)).default,
	};
});
