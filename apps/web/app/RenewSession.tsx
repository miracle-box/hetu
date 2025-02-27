'use client';

import { useQuery } from '@tanstack/react-query';
import { renewSessionCookie } from '~web/libs/actions/auth';

// [TODO] Hacky solution, probably needs a provider for session renewing and user info storage
export function RenewSession() {
	useQuery({
		queryFn: () => renewSessionCookie().then(() => null),
		queryKey: ['renewSessionCookie'],
	});

	return <></>;
}
