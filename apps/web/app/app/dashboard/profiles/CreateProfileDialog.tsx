'use client';

import type { CreateProfileFormValues } from './shared';
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
import { useAppForm } from '@repo/ui/hooks/use-app-form';
import { Icon } from '@repo/ui/icon';
import { mergeForm } from '@tanstack/react-form';
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
			if ('formState' in data) mergeForm<CreateProfileFormValues>(form, data.formState);

			if ('data' in data) {
				void router.push(`/app/dashboard/profiles/${data.data.id}`);
			}
		},
	});

	const form = useAppForm({
		...createProfileFormOpts,
		onSubmit: ({ value }) => request.mutate(value),
	});
	const formId = React.useId();

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create profile</DialogTitle>
					<DialogDescription>Your first profile is primary profile.</DialogDescription>
				</DialogHeader>

				<CreateProfileForm form={form} formId={formId} />

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">Cancel</Button>
					</DialogClose>

					<form.AppForm>
						<form.Submit>
							{(canSubmit, isSubmitting) => (
								<Button type="submit" form={formId} disabled={!canSubmit}>
									{isSubmitting ? (
										<>
											<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Creating Profile...
										</>
									) : (
										'Create Profile'
									)}
								</Button>
							)}
						</form.Submit>
					</form.AppForm>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default CreateProfileDialog;
