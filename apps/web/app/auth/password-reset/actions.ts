'use server';

import type { PasswordResetFormValues } from '~web/libs/modules/auth/forms/PasswordResetForm';
import { requestVerification } from '~web/libs/actions/api';
import { formError } from '~web/libs/utils/form';
import { eitherToResp } from '~web/libs/utils/resp';

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
