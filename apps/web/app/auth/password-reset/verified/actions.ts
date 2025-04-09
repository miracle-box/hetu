'use server';

import type { NewPasswordFormValues } from './shared';
import { setSessionCookie } from '~web/libs/actions/auth';
import { client as api } from '~web/libs/api/eden';
import { formError, formSuccess } from '~web/libs/form/responses';

export async function inspectVerification(id: string) {
	const { data, error } = await api.auth.verification({ id }).get();

	if (error) {
		return null;
	}

	return data;
}

export async function verifyResetVerification(id: string, secret: string): Promise<boolean> {
	const { data, error } = await api.auth.verification.verify.post({
		id,
		code: secret,
	});

	if (error) {
		return false;
	}

	return data.verification.verified;
}

export async function handleResetPassword(form: NewPasswordFormValues) {
	const { data, error } = await api.auth['reset-password'].post({
		newPassword: form.password,
		verificationId: form.verificationId,
	});

	if (error)
		switch (error.status) {
			case 422:
			default:
				// @ts-expect-error [FIXME] Error typing is to be fixed
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				return formError(error.value.error.message as string);
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
