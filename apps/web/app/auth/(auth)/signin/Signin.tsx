'use client';

import { Button } from '@repo/ui/button';
import { Icon } from '@repo/ui/icon';
import { mergeForm } from '@tanstack/form-core';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSigninForm, type SigninFormValues } from '~web/libs/modules/auth/forms/SigninForm';
import { respToEither } from '~web/libs/utils/resp';
import { handleSignin } from './actions';

export function Signin() {
	const router = useRouter();

	const signinMutation = useMutation({
		mutationFn: handleSignin,
		onSuccess: (resp) => {
			respToEither(resp)
				.mapLeft((message) => mergeForm<SigninFormValues>(form, message))
				.ifRight(() => router.push('/'));
		},
	});

	const { form, formId, FormView } = useSigninForm({
		onSubmit: ({ value }) => signinMutation.mutate(value),
	});

	return (
		<>
			<FormView />
			<form.AppForm>
				<form.Submit>
					{(canSubmit, isSubmitting) => (
						<Button
							type="submit"
							form={formId}
							disabled={!canSubmit}
							className="mt-4 w-full"
						>
							{isSubmitting && <Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							<span>Sign In</span>
						</Button>
					)}
				</form.Submit>
			</form.AppForm>
		</>
	);
}
