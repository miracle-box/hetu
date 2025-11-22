'use client';

import { Button } from '@repo/ui/button';
import { Icon } from '@repo/ui/icon';
import { Large } from '@repo/ui/typography';
import { mergeForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';
import { requestVerification } from '~web/libs/actions/api/auth';
import {
	usePasswordResetForm,
	type PasswordResetFormValues,
} from '~web/libs/modules/auth/forms/PasswordResetForm';
import { formError } from '~web/libs/utils/form';
import { respToEither } from '~web/libs/utils/resp';

export default function PasswordReset() {
	const t = useTranslations();
	const router = useRouter();

	const requestResetMutation = useMutation({
		mutationFn: async (values: PasswordResetFormValues) =>
			respToEither(
				await requestVerification({
					type: 'email',
					scenario: 'password_reset',
					target: values.email,
				}),
			).mapLeft(({ message }) => formError(message)),
		onSuccess: (resp) => {
			resp.mapLeft((state) => mergeForm<PasswordResetFormValues>(form, state)).ifRight(() =>
				router.push('/auth/password-reset/email-sent'),
			);
		},
	});

	const { form, formId, FormView } = usePasswordResetForm({
		onSubmit: ({ value }) => requestResetMutation.mutate(value),
	});

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>{t('auth.passwordReset.page.title')}</Large>

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
									<span>{t('common.buttons.sendResetLink')}</span>
								</>
							</Button>
						)}
					</form.Submit>
				</form.AppForm>

				<Button variant="secondary" asChild>
					<Link href="/auth/signup">{t('common.links.iDontHaveAccount')}</Link>
				</Button>

				<Button variant="secondary" asChild>
					<Link href="/auth/signin">{t('common.links.iHaveAccount')}</Link>
				</Button>

				<Button variant="secondary" asChild>
					<Link href="/">{t('common.links.goBackToLanding')}</Link>
				</Button>
			</div>
		</main>
	);
}
