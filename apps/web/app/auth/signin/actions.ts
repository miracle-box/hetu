'use server';

import { ServerValidateError, createServerValidate } from '@tanstack/react-form/nextjs';
import { Value } from '@sinclair/typebox/value';
import { client as api } from '~web/libs/api/eden';
import { formError, formSuccess } from '~web/libs/form/utils';
import { signinFormOpts, signinFormSchema } from './shared';

const validateSigninForm = createServerValidate({
	...signinFormOpts,
	onServerValidate: signinFormSchema,
});

export async function handleSignin(prev: unknown, formData: FormData) {
	try {
		await validateSigninForm(formData);
	} catch (e) {
		if (e instanceof ServerValidateError) return formError(e.formState);
		throw e;
	}

	const form = Value.Parse(signinFormSchema, Object.fromEntries(formData));

	const { data, error } = await api.auth.signin.post(form);

	if (error)
		switch (error.status) {
			case 422:
			default:
				return formError(error.value as unknown as string);
		}

	return formSuccess(data);
}
