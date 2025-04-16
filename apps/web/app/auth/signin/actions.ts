'use server';

import type { SigninFormValues } from '~web/libs/modules/auth/forms/SigninForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { signin } from '~web/libs/actions/api';
import { setSessionCookie } from '~web/libs/actions/auth';
import { formError, formSuccess } from '~web/libs/forms/responses';

export async function handleSignin(form: SigninFormValues) {
	return EitherAsync.fromPromise(() =>
		signin({
			email: form.email,
			password: form.password,
		}),
	)
		.ifRight(async (resp) => {
			await setSessionCookie({
				id: resp.session.id,
				userId: resp.session.userId,
				token: resp.session.token,
				// [TODO] Workaround for Eden bug of incorrectly transforming Date object
				expiresAt: new Date(resp.session.expiresAt),
			});
		})
		.map((resp) => formSuccess(resp))
		.mapLeft((message) => formError(message));
}
