import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getQueryClient } from '~web/libs/api/query';
import { QueryKeys } from '~web/libs/api/query-keys';
import { getClientAppConfig } from '~web/libs/utils/app-config/client';

function ClientConfigLoading() {
	return <div>Loading...</div>;
}

export default async function ClientConfigProvider({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	// Pre-fetch client app config on server side
	await queryClient.prefetchQuery({
		queryKey: QueryKeys.clientAppConfig(),
		queryFn: getClientAppConfig,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<ClientConfigLoading />}>{children}</Suspense>
		</HydrationBoundary>
	);
}
