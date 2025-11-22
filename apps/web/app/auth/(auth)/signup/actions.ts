'use server';

import type { SignupFormValues } from '~web/libs/modules/auth/forms/SignupForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { signup, verifyVerification } from '~web/libs/actions/api/auth';
import { sessionToCookie, writeSessionCookie } from '~web/libs/actions/auth';
import { eitherToResp, respToEither } from '~web/libs/api/resp';
import { formError } from '~web/libs/utils/form';

export async function handleSignup(form: SignupFormValues) {
	const requests = EitherAsync.liftEither(
		respToEither(
			await verifyVerification({
				id: form.verificationId,
				code: form.verificationCode,
			}),
		),
	)
		.chain(async () =>
			respToEither(
				await signup({
					email: form.email,
					name: form.name,
					password: form.password,
					verificationId: form.verificationId,
				}),
			),
		)
		.map(({ session }) => sessionToCookie(session))
		// Do not return session to client!
		.map((session) => writeSessionCookie(session))
		.mapLeft(({ message }) => formError(message));

	return eitherToResp(await requests.run());
}
