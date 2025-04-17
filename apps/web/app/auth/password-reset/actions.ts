'use server';

import type { PasswordResetFormValues } from '~web/libs/modules/auth/forms/PasswordResetForm';
import { redirect } from 'next/navigation';
import { requestVerification } from '~web/libs/actions/api';
import { eitherToResp, formError } from '~web/libs/forms/responses';

export async function handleRequestReset(form: PasswordResetFormValues) {
	const resp = (
		await requestVerification({
			type: 'email',
			scenario: 'password_reset',
			target: form.email,
		})
	)
		.ifRight(() => {
			redirect('/auth/password-reset/email-sent');
		})
		.mapLeft((message) => formError(message));

	return eitherToResp(resp);
}
