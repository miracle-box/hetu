'use client';

import { Button } from '@repo/ui/button';
import { Icon } from '@repo/ui/icon';
import { Large } from '@repo/ui/typography';
import { mergeForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
	usePasswordResetForm,
	type PasswordResetFormValues,
} from '~web/libs/modules/auth/forms/PasswordResetForm';
import { respToEither } from '~web/libs/utils/resp';
import { handleRequestReset } from './actions';

export default function PasswordReset() {
	const router = useRouter();

	const requestResetMutation = useMutation({
		mutationFn: (values: PasswordResetFormValues) => handleRequestReset(values),
		onSuccess: (resp) => {
			respToEither(resp)
				.mapLeft((state) => mergeForm<PasswordResetFormValues>(form, state))
				.ifRight(() => router.push('/auth/password-reset/email-sent'));
		},
	});

	const { form, formId, FormView } = usePasswordResetForm({
		onSubmit: ({ value }) => requestResetMutation.mutate(value),
	});

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Password Reset</Large>

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
									<span>Send Reset Link</span>
								</>
							</Button>
						)}
					</form.Submit>
				</form.AppForm>

				<Button variant="secondary" asChild>
					<Link href="/auth/signup">I don't have an account</Link>
				</Button>

				<Button variant="secondary" asChild>
					<Link href="/auth/signin">I already have an account</Link>
				</Button>

				<Button variant="secondary" asChild>
					<Link href="/">Go back to landing page</Link>
				</Button>
			</div>
		</main>
	);
}
