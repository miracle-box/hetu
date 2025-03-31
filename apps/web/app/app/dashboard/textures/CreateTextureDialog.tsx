'use client';

import type { CreateTextureFormValues } from './shared';
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
			if ('formState' in data) mergeForm<CreateTextureFormValues>(form, data.formState);

			if ('data' in data) {
				void router.push(`/app/dashboard/textures/${data.data.id}`);
			}
		},
	});

	const form = useAppForm({
		...createTextureFormOpts,
		onSubmit: ({ value }) => request.mutate(value),
	});
	const formId = React.useId();

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Texture</DialogTitle>
					<DialogDescription>Upload and manage your textures.</DialogDescription>
				</DialogHeader>

				<CreateTextureForm form={form} formId={formId} />

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
