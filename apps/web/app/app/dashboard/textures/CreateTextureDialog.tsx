'use client';

import React from 'react';
import { Dialog } from '@radix-ui/themes';
import { CreateTextureForm } from './CreateTextureForm';

export type Props = {
	children: React.ReactNode;
};

export function CreateTextureDialog({ children }: Props) {
	return (
		<Dialog.Root>
			<Dialog.Trigger>{children}</Dialog.Trigger>

			<Dialog.Content>
				<Dialog.Title>Create texture</Dialog.Title>
				<Dialog.Description mb="3">Upload a texture for your profiles.</Dialog.Description>

				<CreateTextureForm />
			</Dialog.Content>
		</Dialog.Root>
	);
}
