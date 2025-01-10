'use server';

import { client as api } from '~web/libs/api/eden';
import { formError, formSuccess } from '~web/libs/form/responses';
import { SigninFormValues } from './shared';

export async function handleSignin(form: SigninFormValues) {
	const { data, error } = await api.auth.signin.post(form);

	if (error)
		switch (error.status) {
			case 422:
			default:
				return formError(error.value as unknown as string);
		}

	return formSuccess(data);
}
