'use server';

import type { NewPasswordFormValues } from '#/libs/modules/auth/forms/NewPasswordForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { resetPassword } from '#/libs/actions/api/auth';
import { sessionToCookie, writeSessionCookie } from '#/libs/actions/auth';
import { eitherToResp, respToEither } from '#/libs/api/resp';
import { formError } from '#/libs/utils/form';

export async function handleResetPassword(form: NewPasswordFormValues) {
	const requests = EitherAsync.liftEither(
		respToEither(
			await resetPassword({
				newPassword: form.password,
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
