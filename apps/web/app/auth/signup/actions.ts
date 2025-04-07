'use server';

import type { SignupFormValues } from './shared';
import { setSessionCookie } from '~web/libs/actions/auth';
import { client as api } from '~web/libs/api/eden';
import { formError, formSuccess } from '~web/libs/form/responses';

export async function handleRequestEmailVerification(email: string) {
	const { data, error } = await api.auth.verification.request.post({
		type: 'email',
		scenario: 'signup',
		target: email,
	});

	if (error)
		switch (error.status) {
			case 422:
			default:
				// @ts-expect-error [FIXME] Error typing is to be fixed
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				return formError(error.value.error.message as unknown as string);
		}

	return formSuccess(data);
}

export async function handleVerifyEmailVerification(
	verificationId: string,
	verificationCode: string,
) {
	const { data, error } = await api.auth.verification.verify.post({
		id: verificationId,
		code: verificationCode,
	});

	if (error)
		switch (error.status) {
			case 422:
			default:
				// @ts-expect-error [FIXME] Error typing is to be fixed
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				return formError(error.value.error.message as unknown as string);
		}

	return formSuccess(data);
}

export async function handleSignup(form: SignupFormValues) {
	const { data, error } = await api.auth.signup.post({
		email: form.email,
		name: form.name,
		password: form.password,
		verificationId: form.verificationId,
	});

	if (error)
		switch (error.status) {
			case 422:
			default:
				// @ts-expect-error [FIXME] Error typing is to be fixed
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				return formError(error.value.error.message as unknown as string);
		}

	await setSessionCookie({
		id: data.session.id,
		userId: data.session.userId,
		token: data.session.token,
		// [TODO] Workaround for Eden bug of incorrectly transforming Date object
		expiresAt: new Date(data.session.expiresAt),
	});

	return formSuccess(data);
}
