'use server';

import { client as api } from '~web/libs/api/eden';
import { formError, formSuccess } from '~web/libs/form/responses';
import { setSessionCookie } from '~web/libs/actions/auth';
import { SigninFormValues } from './shared';

export async function handleSignin(form: SigninFormValues) {
	const { data, error } = await api.auth.signin.post(form);

	if (error)
		switch (error.status) {
			case 422:
			default:
				return formError(error.value as unknown as string);
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
