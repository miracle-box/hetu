'use server';

import type { AuthDtos } from '@repo/api-client';
import type { Static } from 'elysia';
import type { SigninFormValues } from '~web/libs/modules/auth/forms/SigninForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { signin } from '~web/libs/actions/api';
import { getOauth2Metadata, requestVerification } from '~web/libs/actions/api/auth';
import { sessionToCookie, writeSessionCookie } from '~web/libs/actions/auth';
import { formError } from '~web/libs/utils/form';
import { eitherToResp } from '~web/libs/utils/resp';

export async function handleSignin(form: SigninFormValues) {
	const requests = EitherAsync.fromPromise(() =>
		signin({
			email: form.email,
			password: form.password,
		}),
	)
		.map(({ session }) => sessionToCookie(session))
		// Do not return session to client!
		.map((session) => writeSessionCookie(session))
		.mapLeft((message) => formError(message));

	return eitherToResp(await requests.run());
}

export async function handleGetOauth2Metadata() {
	return eitherToResp(await getOauth2Metadata());
}

export async function handleRequestVerification(
	body: Static<(typeof AuthDtos.requestVerificationDtoSchemas)['body']>,
) {
	return eitherToResp(await requestVerification(body));
}
