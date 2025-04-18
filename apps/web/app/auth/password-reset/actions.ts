'use server';

import type { PasswordResetFormValues } from '~web/libs/modules/auth/forms/PasswordResetForm';
import { requestVerification } from '~web/libs/actions/api';
import { eitherToResp } from '~web/libs/actions/resp';
import { formError } from '~web/libs/utils/form';

export async function handleRequestReset(form: PasswordResetFormValues) {
	const resp = (
		await requestVerification({
			type: 'email',
			scenario: 'password_reset',
			target: form.email,
		})
	).mapLeft((message) => formError(message));

	return eitherToResp(resp);
}
