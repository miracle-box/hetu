'use client';

import { renewSessionCookie } from '~web/libs/actions/auth';
import { useQuery } from '@tanstack/react-query';

// [TODO] Hacky solution, probably needs a provider for session renewing and user info storage
export function RenewSession() {
	useQuery({
		queryFn: () => renewSessionCookie().then(() => null),
		queryKey: ['renewSessionCookie'],
	});

	return <></>;
}
