'use server';

import { client as api } from '~web/libs/api/eden';
import { formError, formSuccess } from '~web/libs/form/responses';
import { SignupFormValues } from './shared';

export async function handleSignup(form: SignupFormValues) {
	const { data, error } = await api.auth.signup.post({
		email: form.email,
		name: form.name,
		password: form.password,
	});

	if (error)
		switch (error.status) {
			case 422:
			default:
				return formError(error.value as unknown as string);
		}

	return formSuccess(data);
}
