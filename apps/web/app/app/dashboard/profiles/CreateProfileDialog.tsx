'use client';

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
import { mergeForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { respToEither } from '~web/libs/forms/responses';
import {
	useCreateProfileForm,
	type CreateProfileFormValues,
} from '~web/libs/modules/profiles/forms/CreateProfileForm';
import { handleCreateProfile } from './actions';

export type Props = {
	children: React.ReactNode;
};

export function CreateProfileDialog({ children }: Props) {
	const router = useRouter();

	const request = useMutation({
		mutationFn: (values: CreateProfileFormValues) => handleCreateProfile(values),
		onSuccess: (resp) =>
			respToEither(resp)
				.map(({ profile }) => {
					router.push(`/app/dashboard/profiles/${profile.id}`);
				})
				.mapLeft((state) => {
					mergeForm<CreateProfileFormValues>(form, state);
				}),
	});

	const { form, formId, FormView } = useCreateProfileForm({
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

				<FormView />

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
