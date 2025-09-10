'use server';

import type { SigninFormValues } from '~web/libs/modules/auth/forms/SigninForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { signin } from '~web/libs/actions/api';
import { sessionToCookie, writeSessionCookie } from '~web/libs/actions/auth';
import { formError } from '~web/libs/utils/form';
import { eitherToResp, respToEither } from '~web/libs/utils/resp';

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
		.mapLeft((message) => formError(message));

	return eitherToResp(await requests.run());
}
