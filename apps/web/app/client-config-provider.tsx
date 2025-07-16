import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getClientAppConfigAction } from '~web/libs/actions/get-client-site-config';
import { getQueryClient } from '~web/libs/api/query';

function ClientConfigLoading() {
	return <div>Loading...</div>;
}

export default async function ClientConfigProvider({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	// Pre-fetch client app config on server side
	await queryClient.prefetchQuery({
		queryKey: ['clientAppConfig', process.env.NEXT_PUBLIC_BUILD_ID],
		queryFn: getClientAppConfigAction,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<ClientConfigLoading />}>{children}</Suspense>
		</HydrationBoundary>
	);
}
