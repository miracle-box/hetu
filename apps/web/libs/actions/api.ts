'use server';

import { Left, Right } from 'purify-ts/Either';
import { readSession } from '~web/libs/actions/auth';
import { client as api } from '~web/libs/api/eden';

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
	const session = await readSession();
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
	const session = await readSession();
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

export async function uploadFile(body: { file: File; type: 'texture_skin' | 'texture_cape' }) {
	const session = await readSession();

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
	const session = await readSession();

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
	const session = await readSession();

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

export async function verifyVerification(body: { id: string; code: string }) {
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

export async function resetPassword(body: { newPassword: string; verificationId: string }) {
	return api.auth['reset-password']
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
			return Left('Failed to reset password.');
		});
}

export async function signin(body: { email: string; password: string }) {
	return api.auth.signin
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
			return Left('Failed to sign in.');
		});
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
			if (error)
				switch (error.status) {
					default:
						return Left(error.value.error.message);
				}

			return Right(data);
		})
		.catch(() => {
			return Left('Failed to sign up.');
		});
}

export async function renewSession(authToken: string) {
	return api.auth.validate
		.post(null, {
			headers: { Authorization: `Bearer ${authToken}` },
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
			return Left('Failed to renew session.');
		});
}

export async function refreshSession(authToken: string) {
	return api.auth.sessions.refresh
		.post(null, {
			headers: { Authorization: `Bearer ${authToken}` },
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
			return Left('Failed to refresh session.');
		});
}
