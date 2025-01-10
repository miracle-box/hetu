'use client';

import { useZustandStore } from '~web/libs/stores/use-zustand-store';
import { useSessionStore } from '~web/libs/stores/session';
import { DataList } from '@radix-ui/themes';

export function SessionInfo() {
	const session = useZustandStore(useSessionStore, (state) => state.session);

	return (
		session && (
			<DataList.Root>
				<DataList.Item align="center">
					<DataList.Label>User ID</DataList.Label>
					<DataList.Value>{session.userId}</DataList.Value>
				</DataList.Item>
				<DataList.Item align="center">
					<DataList.Label>Session ID</DataList.Label>
					<DataList.Value>{session.id}</DataList.Value>
				</DataList.Item>
				<DataList.Item align="center">
					<DataList.Label>Session Token</DataList.Label>
					<DataList.Value>{session.token}</DataList.Value>
				</DataList.Item>
				<DataList.Item align="center">
					<DataList.Label>Expires At</DataList.Label>
					<DataList.Value>{session.expiresAt.toString()}</DataList.Value>
				</DataList.Item>
			</DataList.Root>
		)
	);
}
