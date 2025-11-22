'use server';

import type { API } from '@repo/api-client';
import { client as api } from '~web/libs/api/eden';
import { handleResponse } from '~web/libs/api/response';
import { readSession } from '../auth';

export async function createProfile(body: API.Profiles.CreateProfile.Body) {
	const session = await readSession();

	return await handleResponse(
		api.profiles.post(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function updateProfile(
	params: API.Profiles.UpdateProfile.Param,
	body: API.Profiles.UpdateProfile.Body,
) {
	const session = await readSession();
	return await handleResponse(
		api.profiles(params).put(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function deleteProfile(params: API.Profiles.DeleteProfile.Param) {
	const session = await readSession();

	return await handleResponse(
		api.profiles(params).delete(
			{},
			{
				headers: { Authorization: `Bearer ${session.authToken}` },
			},
		),
	);
}
