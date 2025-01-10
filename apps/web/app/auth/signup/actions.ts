'use server';

import { createServerValidate, ServerValidateError } from '@tanstack/react-form/nextjs';
import { Value } from '@sinclair/typebox/value';
import { signupFormOpts, signupFormSchema } from '~web/app/auth/signup/shared';
import { client as api } from '~web/libs/api/eden';
import { formError, formSuccess } from '~web/libs/form/utils';

const validateSignupForm = createServerValidate({
	...signupFormOpts,
	onServerValidate: signupFormSchema,
});

export async function handleSignup(prev: unknown, formData: FormData) {
	try {
		await validateSignupForm(formData);
	} catch (e) {
		if (e instanceof ServerValidateError) return formError(e.formState);
		throw e;
	}

	const form = Value.Parse(signupFormSchema, Object.fromEntries(formData));

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
