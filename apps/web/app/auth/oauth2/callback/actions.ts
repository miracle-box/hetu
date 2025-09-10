'use server';

import type { AuthDtos } from '@repo/api-client';
import type { Static } from 'elysia';
import { EitherAsync } from 'purify-ts';
import { oauth2Signin } from '~web/libs/actions/api/auth';
import { sessionToCookie, writeSessionCookie } from '~web/libs/actions/auth';
import { eitherToResp, respToEither } from '~web/libs/utils/resp';

export async function handleOAuth2Signin(
	body: Static<(typeof AuthDtos.oauth2SigninDtoSchemas)['body']>,
) {
	const request = EitherAsync.liftEither(respToEither(await oauth2Signin(body)))
		.map(async ({ session }) => sessionToCookie(session))
		// Do not return session to client!
		.map(async (session) => writeSessionCookie(session));

	return eitherToResp(await request.run());
}
