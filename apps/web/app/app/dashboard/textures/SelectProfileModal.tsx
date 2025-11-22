'use client';

import type { API } from '@repo/api-client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getMyProfiles } from '~web/libs/actions/api/me';
import { SelectProfileModalView } from '~web/libs/modules/profiles/components/SelectProfileModalView';
import { ApiError } from '~web/libs/utils/api-response';
import { respToEither } from '~web/libs/utils/resp';

export type Props = {
	children: React.ReactNode;
	onSelect: (profile: API.Profiles.Entities.Profile) => void;
};

export function SelectProfileModal({ children, onSelect }: Props) {
	const [open, setOpen] = useState(false);

	const profiles = useQuery({
		queryKey: ['profiles', '(userid)'],
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
