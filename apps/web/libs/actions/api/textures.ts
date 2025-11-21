'use server';

import type { API } from '@repo/api-client';
import { client as api } from '~web/libs/api/eden';
import { handleResponse } from '~web/libs/utils/api-response';
import { readSession } from '../auth';

export async function createTexture(body: API.Textures.CreateTexture.Body) {
	const session = await readSession();

	return handleResponse(
		api.textures.post(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function updateTexture(
	params: API.Textures.UpdateTexture.Param,
	body: API.Textures.UpdateTexture.Body,
) {
	const session = await readSession();

	return handleResponse(
		api.textures(params).put(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function deleteTexture(params: API.Textures.DeleteTexture.Param) {
	const session = await readSession();

	return handleResponse(
		api.textures(params).delete(
			{},
			{
				headers: { Authorization: `Bearer ${session.authToken}` },
			},
		),
	);
}

export async function getTextureImage(params: API.Textures.GetTextureImage.Param) {
	const session = await readSession();

	return handleResponse(
		api.textures(params).image.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}
