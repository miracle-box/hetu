'use client';

import { useQuery } from '@tanstack/react-query';
import { validateSession } from '~web/libs/actions/auth';

export function SessionManager() {
	useQuery({
		queryKey: ['session-info'],
		queryFn: validateSession,
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		retry: false,
	});

	return undefined;
}
