import type { AuthDtos } from '@repo/api-client';
import type { Static } from 'elysia';
import { Left, Right } from 'purify-ts';
import { client as api } from '~web/libs/api/eden';
import { mapApiError, mapFetchError } from '~web/libs/utils/api-error';

export async function getOauth2Metadata() {
	return api.auth.oauth2.metadata
		.get()
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function requestVerification(
	body: Static<(typeof AuthDtos.requestVerificationDtoSchemas)['body']>,
) {
	return api.auth.verification.request
		.post(body)
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}
