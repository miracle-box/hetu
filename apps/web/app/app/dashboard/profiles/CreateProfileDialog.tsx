'use client';

import React from 'react';
import { Dialog } from '@radix-ui/themes';
import { CreateProfileForm } from '~web/app/app/dashboard/profiles/CreateProfileForm';

export type Props = {
	children: React.ReactNode;
};

export default function CreateProfileDialog({ children }: Props) {
	return (
		<Dialog.Root>
			<Dialog.Trigger>{children}</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Title>Create profile</Dialog.Title>
				<Dialog.Description mb="3">
					Your first profile is the primary profile.
				</Dialog.Description>

				<CreateProfileForm />
			</Dialog.Content>
		</Dialog.Root>
	);
}
