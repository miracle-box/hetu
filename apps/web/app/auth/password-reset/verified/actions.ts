'use server';

import type { NewPasswordFormValues } from '~web/libs/modules/auth/forms/NewPasswordForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { resetPassword } from '~web/libs/actions/api';
import { sessionToCookie, writeSessionCookie } from '~web/libs/actions/auth';
import { formError } from '~web/libs/utils/form';
import { eitherToResp } from '~web/libs/utils/resp';

export async function handleResetPassword(form: NewPasswordFormValues) {
	const requests = EitherAsync.fromPromise(() =>
		resetPassword({
			newPassword: form.password,
			verificationId: form.verificationId,
		}),
	)
		.map(({ session }) => sessionToCookie(session))
		// Do not return session to client!
		.map((session) => writeSessionCookie(session))
		.mapLeft((message) => formError(message));

	return eitherToResp(await requests.run());
}
