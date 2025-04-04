'use server';

import type { SigninFormValues } from './shared';
import { setSessionCookie } from '~web/libs/actions/auth';
import { client as api } from '~web/libs/api/eden';
import { formError, formSuccess } from '~web/libs/form/responses';

export async function handleSignin(form: SigninFormValues) {
	const { data, error } = await api.auth.signin.post(form);

	if (error)
		switch (error.status) {
			case 400:
			case 500:
				return formError(error.value.error.message);
			default:
				return formError(error.value.message ?? 'An unknown error occurred');
		}

	await setSessionCookie({
		id: data.session.id,
		userId: data.session.userId,
		token: data.session.token,
		// [TODO] Workaround for Eden bug of incorrectly transforming Date object
		expiresAt: new Date(data.session.expiresAt),
	});

	return formSuccess(null);
}
