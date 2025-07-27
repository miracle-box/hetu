import type { AuthDtos } from '@repo/api-client';
import type { Static } from 'elysia';
import { Left, Right } from 'purify-ts';
import { client as api } from '~web/libs/api/eden';
import { mapApiError, mapFetchError } from '~web/libs/utils/api-error';
import { readSession } from '../auth';

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

export async function verifyVerification(
	body: Static<(typeof AuthDtos.verifyVerificationDtoSchemas)['body']>,
) {
	return api.auth.verification.verify
		.post(body)
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function oauth2Signin(body: Static<(typeof AuthDtos.oauth2SigninDtoSchemas)['body']>) {
	return api.auth.oauth2.signin
		.post(body)
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function inspectOauth2Binding(
	params: Static<(typeof AuthDtos.checkOauth2BindingDtoSchemas)['params']>,
) {
	const session = await readSession();

	return api.auth.oauth2
		.bind(params)
		.check.post(
			{},
			{
				headers: { Authorization: `Bearer ${session.authToken}` },
			},
		)
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function confirmOauth2Binding(
	params: Static<(typeof AuthDtos.confirmOauth2BindingDtoSchemas)['params']>,
) {
	const session = await readSession();

	return api.auth.oauth2
		.bind(params)
		.confirm.post(
			{},
			{
				headers: { Authorization: `Bearer ${session.authToken}` },
			},
		)
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}
