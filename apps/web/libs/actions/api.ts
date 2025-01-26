'use server';

import { validateSession } from '~web/libs/actions/auth';
import { client as api } from '~web/libs/api/eden';

export async function getUserInfo() {
	const session = await validateSession();
	if (!session) return null;

	const { data, error } = await api
		.users({
			id: session.userId,
		})
		.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		});

	if (!data) {
		return null;
	}

	return data.user;
}

export async function getUserProfiles() {
	const session = await validateSession();
	if (!session) return null;

	const { data, error } = await api
		.users({
			id: session.userId,
		})
		.profiles.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		});

	if (!data) {
		return null;
	}

	return data.profiles;
}

export async function getUserTextures() {
	const session = await validateSession();
	if (!session) return null;

	const { data, error } = await api
		.users({
			id: session.userId,
		})
		.textures.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		});

	if (!data) {
		return null;
	}

	return data.textures;
}

export async function uploadTexture(body: { file: File; type: 'texture_skin' | 'texture_cape' }) {
	const session = await validateSession();
	if (!session) return null;

	const { data, error } = await api.files.index.post(
		{
			// @ts-expect-error [TODO] Eden incorrectly infer type as Files
			type: body.type,
			file: body.file,
		},
		{
			headers: { Authorization: `Bearer ${session.authToken}` },
		},
	);

	if (!data) {
		return null;
	}

	return data.file;
}

export async function createTexture(body: {
	type: 'cape' | 'skin' | 'skin_slim';
	name: string;
	description: string;
	hash: string;
}) {
	const session = await validateSession();
	if (!session) return null;

	const { data, error } = await api.textures.index.post(body, {
		headers: { Authorization: `Bearer ${session.authToken}` },
	});

	if (!data) {
		return null;
	}

	return data.texture;
}

export async function createProfile(body: { name: string }) {
	const session = await validateSession();
	if (!session) return null;

	const { data, error } = await api.profiles.index.post(body, {
		headers: { Authorization: `Bearer ${session.authToken}` },
	});

	if (!data) {
		return null;
	}

	return data.profile;
}
