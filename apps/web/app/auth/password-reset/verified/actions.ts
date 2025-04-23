'use server';

import type { NewPasswordFormValues } from '~web/libs/modules/auth/forms/NewPasswordForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { resetPassword } from '~web/libs/actions/api';
import { setSessionCookie } from '~web/libs/actions/auth';
import { eitherToResp } from '~web/libs/utils/resp';
import { formError } from '~web/libs/utils/form';

export async function handleResetPassword(form: NewPasswordFormValues) {
	const requests = EitherAsync.fromPromise(() =>
		resetPassword({
			newPassword: form.password,
			verificationId: form.verificationId,
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
		.mapLeft((message) => formError(message));

	return eitherToResp(await requests.run());
}
