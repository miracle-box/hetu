'use server';

import { Left, Right } from 'purify-ts/Either';
import { validateSession } from '~web/libs/actions/auth';
import { client as api } from '~web/libs/api/eden';

export async function getUserInfo() {
	const session = await validateSession();

	return api
		.users({
			id: session.userId,
		})
		.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			if (error)
				switch (error.status) {
					default:
						return Left(error.value.error.message);
				}

			return Right(data);
		})
		.catch(() => {
			return Left('Failed to fetch user info.');
		});
}

export async function getUserProfiles() {
	const session = await validateSession();
	if (!session) return Left('Unauthorized');

	return api
		.users({
			id: session.userId,
		})
		.profiles.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			if (error)
				switch (error.status) {
					default:
						return Left(error.value.error.message);
				}

			return Right(data);
		})
		.catch(() => {
			return Left('Failed to fetch profiles.');
		});
}

export async function getUserTextures() {
	const session = await validateSession();
	if (!session) return Left('Unauthorized');

	return api
		.users({
			id: session.userId,
		})
		.textures.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			if (error)
				switch (error.status) {
					default:
						return Left(error.value.error.message);
				}

			return Right(data);
		})
		.catch(() => {
			return Left('Failed to fetch textures.');
		});
}

export async function uploadTexture(body: { file: File; type: 'texture_skin' | 'texture_cape' }) {
	const session = await validateSession();

	return api.files.index
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
			if (error) {
				switch (error.status) {
					// [FIXME] 201 is not an error. This is a workaround for Eden Treaty bug
					case 201:
						return Right(error.value);
					default:
						return Left(error.value.error.message);
				}
			}

			return Right(data);
		})
		.catch(() => {
			return Left('Failed to upload texture.');
		});
}

export async function createTexture(body: {
	type: 'cape' | 'skin' | 'skin_slim';
	name: string;
	description: string;
	hash: string;
}) {
	const session = await validateSession();

	return api.textures.index
		.post(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			if (error)
				switch (error.status) {
					// [FIXME] 201 is not an error. This is a workaround for Eden Treaty bug
					case 201:
						return Right(error.value);
					default:
						return Left(error.value.error.message);
				}

			return Right(data);
		})
		.catch(() => {
			return Left('Failed to create texture.');
		});
}

export async function createProfile(body: { name: string }) {
	const session = await validateSession();

	return api.profiles.index
		.post(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		})
		.then(({ data, error }) => {
			if (error)
				switch (error.status) {
					// [FIXME] 201 is not an error. This is a workaround for Eden Treaty bug
					case 201:
						return Right(error.value);
					default:
						return Left(error.value.error.message);
				}

			return Right(data);
		})
		.catch(() => {
			return Left('Failed to create profile.');
		});
}

export async function inspectVerification(id: string) {
	return api.auth
		.verification({ id })
		.get()
		.then(({ data, error }) => {
			if (error)
				switch (error.status) {
					default:
						return Left(error.value.error.message);
				}

			return Right(data);
		})
		.catch(() => {
			return Left('Failed to fetch verification.');
		});
}

export async function requestVerification(body: {
	type: 'email';
	scenario: 'signup' | 'password_reset';
	target: string;
}) {
	return api.auth.verification.request
		.post(body)
		.then(({ data, error }) => {
			if (error)
				switch (error.status) {
					default:
						return Left(error.value.error.message);
				}

			return Right(data);
		})
		.catch(() => {
			return Left('Failed to request verification.');
		});
}

export async function verifyResetVerification(body: { id: string; code: string }) {
	return api.auth.verification.verify
		.post(body)
		.then(({ data, error }) => {
			if (error)
				switch (error.status) {
					default:
						return Left(error.value.error.message);
				}

			return Right(data);
		})
		.catch(() => {
			return Left('Failed to verify verification.');
		});
}
