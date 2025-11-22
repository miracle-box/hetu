'use server';

import type { API } from '@repo/api-client';
import { EitherAsync } from 'purify-ts';
import { oauth2Signin } from '~web/libs/actions/api/auth';
import { sessionToCookie, writeSessionCookie } from '~web/libs/actions/auth';
import { eitherToResp, respToEither } from '~web/libs/api/resp';

export async function handleOAuth2Signin(body: API.Auth.Oauth2Signin.Body) {
	const request = EitherAsync.liftEither(respToEither(await oauth2Signin(body)))
		.map(async ({ session }) => sessionToCookie(session))
		// Do not return session to client!
		.map(async (session) => writeSessionCookie(session));

	return eitherToResp(await request.run());
}
