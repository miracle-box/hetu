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

import { respToEither } from '~web/libs/actions/resp';
import {
	useCreateTextureForm,
	type CreateTextureFormValues,
} from '~web/libs/modules/textures/forms/CreateTextureForm';
import { handleCreateTexture } from './actions';

export type Props = {
	children: React.ReactNode;
};

export function CreateTextureDialog({ children }: Props) {
	const router = useRouter();

	const request = useMutation({
		mutationFn: (values: CreateTextureFormValues) => handleCreateTexture(values),
		onSuccess: (resp) =>
			respToEither(resp)
				.mapLeft((state) => mergeForm<CreateTextureFormValues>(form, state))
				.ifRight(({ texture }) => router.push(`/app/dashboard/textures/${texture.id}`)),
	});

	const { form, formId, FormView } = useCreateTextureForm({
		onSubmit: ({ value }) => request.mutate(value),
	});

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Texture</DialogTitle>
					<DialogDescription>Upload and manage your textures.</DialogDescription>
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
											Creating Texture...
										</>
									) : (
										'Create Texture'
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

export default CreateTextureDialog;
