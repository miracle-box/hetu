'use client';

import type { API } from '@repo/api-client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getMyProfiles } from '~web/libs/actions/api/me';
import { QueryKeys } from '~web/libs/api/query-keys';
import { respToEither } from '~web/libs/api/resp';
import { ApiError } from '~web/libs/api/response';
import { SelectProfileModalView } from '~web/libs/modules/profiles/components/SelectProfileModalView';

export type Props = {
	children: React.ReactNode;
	onSelect: (profile: API.Profiles.Entities.Profile) => void;
};

export function SelectProfileModal({ children, onSelect }: Props) {
	const [open, setOpen] = useState(false);

	const profiles = useQuery({
		queryKey: QueryKeys.profiles(),
		queryFn: async () =>
			respToEither(await getMyProfiles())
				.mapLeft((error) => Promise.reject(new ApiError(error)))
				.extract(),
	});

	return (
		<SelectProfileModalView
			Trigger={children}
			profiles={profiles.data?.profiles ?? []}
			open={open}
			onOpenChange={setOpen}
			onSelect={(profile) => {
				onSelect(profile);
				setOpen(false);
			}}
		/>
	);
}
