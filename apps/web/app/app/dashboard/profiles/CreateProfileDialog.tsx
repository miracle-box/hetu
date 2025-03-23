'use client';

import type { CreateProfileFormValues } from './shared';
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
import { handleCreateProfile } from './actions';
import { CreateProfileForm } from './CreateProfileForm';
import { createProfileFormOpts } from './shared';

export type Props = {
	children: React.ReactNode;
};

export function CreateProfileDialog({ children }: Props) {
	const router = useRouter();

	const request = useMutation({
		mutationFn: (values: CreateProfileFormValues) => handleCreateProfile(values),
		onSuccess: (data) => {
			if ('formState' in data)
				mergeForm<CreateProfileFormValues, TypeboxValidator>(form, data.formState);

			if ('data' in data) {
				void router.push(`/app/dashboard/profiles/${data.data.id}`);
			}
		},
	});

	const form = useForm({
		...createProfileFormOpts,
		onSubmit: ({ value }) => request.mutate(value),
	});

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create profile</DialogTitle>
					<DialogDescription>Your first profile is primary profile.</DialogDescription>
				</DialogHeader>

				<CreateProfileForm form={form} />

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
									'Create profile'
								)}
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default CreateProfileDialog;
