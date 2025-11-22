'use server';

import type { SigninFormValues } from '#/libs/modules/auth/forms/SigninForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { signin } from '#/libs/actions/api/auth';
import { sessionToCookie, writeSessionCookie } from '#/libs/actions/auth';
import { eitherToResp, respToEither } from '#/libs/api/resp';
import { formError } from '#/libs/utils/form';

export async function handleSignin(form: SigninFormValues) {
	const requests = EitherAsync.liftEither(
		respToEither(
			await signin({
				email: form.email,
				password: form.password,
			}),
		),
	)
		.map(({ session }) => sessionToCookie(session))
		// Do not return session to client!
		.map((session) => writeSessionCookie(session))
		.mapLeft(({ message }) => formError(message));

	return eitherToResp(await requests.run());
}
