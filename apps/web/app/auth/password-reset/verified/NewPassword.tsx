'use client';

import { Button } from '@repo/ui/button';
import { Icon } from '@repo/ui/icon';
import { mergeForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
	useNewPasswordForm,
	type NewPasswordFormValues,
} from '~web/libs/modules/auth/forms/NewPasswordForm';
import { respToEither } from '~web/libs/utils/resp';
import { handleResetPassword } from './actions';

export function NewPassword({ verificationId }: { verificationId: string }) {
	const router = useRouter();

	const resetPasswordMutation = useMutation({
		mutationFn: (values: NewPasswordFormValues) => handleResetPassword(values),
		onSuccess: (resp) => {
			respToEither(resp)
				.mapLeft((state) => mergeForm<NewPasswordFormValues>(form, state))
				.ifRight(() => router.push('/'));
		},
	});

	const { form, formId, FormView } = useNewPasswordForm({
		onSubmit: ({ value }) => resetPasswordMutation.mutate(value),
	});

	React.useEffect(() => {
		form.setFieldValue('verificationId', verificationId);
	}, [verificationId, form]);

	return (
		<div className="flex w-full flex-col gap-2">
			<FormView />
			<form.AppForm>
				<form.Submit>
					{(canSubmit, isSubmitting) => (
						<Button
							type="submit"
							form={formId}
							className="w-full"
							disabled={!canSubmit}
						>
							<>
								{isSubmitting && (
									<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								<span>Reset Password</span>
							</>
						</Button>
					)}
				</form.Submit>
			</form.AppForm>
		</div>
	);
}
