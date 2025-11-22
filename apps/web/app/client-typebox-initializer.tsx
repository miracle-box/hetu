'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { initializeTypeBoxErrorMessage } from '../libs/utils/typebox-mesage';

/**
 * Initialize error function for TypeBox
 */
export function ClientTypeBoxInitializer() {
	const t = useTranslations();

	useEffect(() => {
		initializeTypeBoxErrorMessage(t);
	}, [t]);

	return null;
}
