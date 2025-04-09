'use server';

import type { PasswordResetFormValues } from './shared';
import { client as api } from '~web/libs/api/eden';
import { formError, formSuccess } from '~web/libs/form/responses';

export async function handleRequestPasswordResetEmailVerification(form: PasswordResetFormValues) {
	const { data, error } = await api.auth.verification.request.post({
		type: 'email',
		scenario: 'password_reset',
		target: form.email,
	});

	if (error)
		switch (error.status) {
			default:
				// @ts-expect-error [FIXME] Error typing is to be fixed
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				return formError(error.value.error.message as unknown as string);
		}

	return formSuccess(data);
}
