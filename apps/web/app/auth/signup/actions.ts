'use server';

import type { SignupFormValues } from '~web/libs/modules/auth/forms/SignupForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { signup, verifyVerification } from '~web/libs/actions/api';
import { sessionToCookie, writeSessionCookie } from '~web/libs/actions/auth';
import { formError } from '~web/libs/utils/form';
import { eitherToResp } from '~web/libs/utils/resp';

export async function handleSignup(form: SignupFormValues) {
	const requests = EitherAsync.fromPromise(() =>
		verifyVerification({
			id: form.verificationId,
			code: form.verificationCode,
		}),
	)
		.chain(() =>
			signup({
				email: form.email,
				name: form.name,
				password: form.password,
				verificationId: form.verificationId,
			}),
		)
		.map(({ session }) => sessionToCookie(session))
		// Do not return session to client!
		.map((session) => writeSessionCookie(session))
		.mapLeft((message) => formError(message));

	return eitherToResp(await requests.run());
}
