'use client';

import type { ProfilesEntities } from '@repo/api-client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { SelectProfileModalView } from '~web/libs/modules/profiles/components/SelectProfileModalView';
import { ApiError } from '~web/libs/utils/api-error';
import { respToEither } from '~web/libs/utils/resp';
import { handleGetUserProfiles } from './actions';

export type Props = {
	children: React.ReactNode;
	onSelect: (profile: ProfilesEntities.Profile) => void;
};

export function SelectProfileModal({ children, onSelect }: Props) {
	const [open, setOpen] = useState(false);

	const profiles = useQuery({
		queryKey: ['profiles', '(userid)'],
		queryFn: () =>
			handleGetUserProfiles().then((resp) =>
				respToEither(resp)
					.mapLeft((error) => Promise.reject(new ApiError(error)))
					.extract(),
			),
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
