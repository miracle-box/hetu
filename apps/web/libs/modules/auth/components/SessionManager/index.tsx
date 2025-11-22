'use client';

import { useQuery } from '@tanstack/react-query';
import { validateSession } from '~web/libs/actions/auth';
import { QueryKeys } from '~web/libs/api/query-keys';

export function SessionManager() {
	// [TODO] Prefetch session info on server side and pass it to the client,
	// [TODO] and expose a hook to get the session info.
	useQuery({
		queryKey: QueryKeys.sessionInfo(),
		queryFn: validateSession,
		gcTime: Infinity,
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		retry: false,
	});

	return undefined;
}
