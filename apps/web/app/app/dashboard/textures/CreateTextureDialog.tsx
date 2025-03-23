'use client';

import type { CreateTextureFormValues } from './shared';
import type { TypeboxValidator } from '@repo/typebox-form-adapter';
import { Button } from '@repo/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@repo/ui/dialog';
import { Icon } from '@repo/ui/icon';
import { mergeForm, useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { handleCreateTexture } from './actions';
import { CreateTextureForm } from './CreateTextureForm';
import { createTextureFormOpts } from './shared';

export type Props = {
	children: React.ReactNode;
};

export function CreateTextureDialog({ children }: Props) {
	const router = useRouter();

	const request = useMutation({
		mutationFn: (values: CreateTextureFormValues) => handleCreateTexture(values),
		onSuccess: (data) => {
			if ('formState' in data)
				mergeForm<CreateTextureFormValues, TypeboxValidator>(form, data.formState);

			if ('data' in data) {
				void router.push(`/app/dashboard/textures/${data.data.id}`);
			}
		},
	});

	const form = useForm({
		...createTextureFormOpts,
		onSubmit: ({ value }) => request.mutate(value),
	});

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create texture</DialogTitle>
					<DialogDescription>Upload a texture for your profiles.</DialogDescription>
				</DialogHeader>

				<CreateTextureForm form={form} />

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">Cancel</Button>
					</DialogClose>

					<form.Subscribe
						selector={(formState) => [formState.canSubmit, formState.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button
								disabled={!canSubmit}
								onClick={() => {
									void form.handleSubmit();
								}}
							>
								{isSubmitting ? (
									<Icon.Loader2 className="animate-spin" />
								) : (
									'Create texture'
								)}
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
