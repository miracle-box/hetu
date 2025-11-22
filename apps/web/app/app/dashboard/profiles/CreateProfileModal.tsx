'use client';

import { mergeForm, useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { createProfile } from '~web/libs/actions/api/profiles';
import { CreateProfileModalView } from '~web/libs/modules/profiles/components/CreateProfileModalView';
import {
	useCreateProfileForm,
	type CreateProfileFormValues,
} from '~web/libs/modules/profiles/forms/CreateProfileForm';
import { formError } from '~web/libs/utils/form';
import { respToEither } from '~web/libs/utils/resp';

export type Props = {
	children: React.ReactNode;
};

export function CreateProfileModal({ children }: Props) {
	const router = useRouter();

	const request = useMutation({
		mutationFn: async (values: CreateProfileFormValues) =>
			respToEither(await createProfile(values)).mapLeft((error) => formError(error)),
		onSuccess: (resp) =>
			resp
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
	const canSubmit = useStore(form.store, (state) => state.canSubmit);
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	return (
		<CreateProfileModalView
			Trigger={children}
			FormView={FormView}
			formId={formId}
			canSubmit={canSubmit}
			isSubmitting={isSubmitting}
		/>
	);
}
