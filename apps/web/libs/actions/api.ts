'use server';

import type { Static } from '@sinclair/typebox';
import { ProfilesDtos } from '@repo/api-client';
import { Left, Right } from 'purify-ts/Either';
import { readSession } from '~web/libs/actions/auth';
import { client as api } from '~web/libs/api/eden';
import { mapApiError, mapFetchError } from '../utils/api-error';

export async function getUserInfo() {
	const session = await readSession();

	return api
		.users({
			id: session.userId,
		})
		.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function getUserProfiles() {
	const session = await readSession();

	return api
		.users({
			id: session.userId,
		})
		.profiles.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function getUserTextures() {
	const session = await readSession();

	return api
		.users({
			id: session.userId,
		})
		.textures.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function uploadFile(body: { file: File; type: 'texture_skin' | 'texture_cape' }) {
	const session = await readSession();

	return api.files
		.post(
			{
				type: body.type,
				file: body.file,
			},
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

export async function createTexture(body: {
	type: 'cape' | 'skin' | 'skin_slim';
	name: string;
	description: string;
	hash: string;
}) {
	const session = await readSession();

	return api.textures
		.post(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function createProfile(body: { name: string }) {
	const session = await readSession();

	return api.profiles
		.post(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function inspectVerification(id: string) {
	return api.auth
		.verification({ id })
		.get()
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function requestVerification(body: {
	type: 'email';
	scenario: 'signup' | 'password_reset';
	target: string;
}) {
	return api.auth.verification.request
		.post(body)
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function verifyVerification(body: { id: string; code: string }) {
	return api.auth.verification.verify
		.post(body)
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function resetPassword(body: { newPassword: string; verificationId: string }) {
	return api.auth['reset-password']
		.post(body)
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function signin(body: { email: string; password: string }) {
	return api.auth.signin
		.post(body)
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function signup(body: {
	name: string;
	email: string;
	password: string;
	verificationId: string;
}) {
	return api.auth.signup
		.post(body)
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function renewSession(authToken: string) {
	return api.auth.validate
		.post(null, {
			headers: { Authorization: `Bearer ${authToken}` },
		})
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function refreshSession(authToken: string) {
	return api.auth.sessions.refresh
		.post(null, {
			headers: { Authorization: `Bearer ${authToken}` },
		})
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function updateProfile(
	id: string,
	body: Static<(typeof ProfilesDtos.updateProfileDtoSchemas)['body']>,
) {
	const session = await readSession();
	return api
		.profiles({
			id,
		})
		.put(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function getUserMcClaims() {
	const session = await readSession();

	return api
		.users({ id: session.userId })
		['mc-claims'].get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}

export async function verifyUserMcClaim(body: { verificationId: string }) {
	const session = await readSession();

	return api
		.users({ id: session.userId })
		['mc-claims'].post(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			const errResp = mapApiError(error);
			if (errResp) return Left(errResp);

			return Right(data!);
		})
		.catch((error) => Left(mapFetchError(error)));
}
