'use client';

import { mergeForm, useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';

import { CreateTextureModalView } from '~web/libs/modules/textures/components/CreateTextureModalView';
import {
	useCreateTextureForm,
	type CreateTextureFormValues,
} from '~web/libs/modules/textures/forms/CreateTextureForm';
import { respToEither } from '~web/libs/utils/resp';
import { handleCreateTexture } from './actions';

export type Props = {
	children: React.ReactNode;
};

export function CreateTextureModal({ children }: Props) {
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
	const canSubmit = useStore(form.store, (state) => state.canSubmit);
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	return (
		<CreateTextureModalView
			Trigger={children}
			FormView={FormView}
			formId={formId}
			canSubmit={canSubmit}
			isSubmitting={isSubmitting}
		/>
	);
}
