'use server';

import type { API } from '@repo/api-client';
import { client as api } from '~web/libs/api/eden';
import { handleResponse } from '~web/libs/utils/api-response';
import { readSession } from '../auth';

export async function getUserInfo(params: API.Users.GetUserInfo.Param) {
	const session = await readSession();

	return await handleResponse(
		api.users(params).get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function getUserProfiles(params: API.Users.GetUserProfiles.Param) {
	const session = await readSession();

	return await handleResponse(
		api.users(params).profiles.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function getUserTextures(params: API.Users.GetUserTextures.Param) {
	const session = await readSession();

	return await handleResponse(
		api.users(params).textures.get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function getUserMcClaims(params: API.Users.ListMcClaims.Param) {
	const session = await readSession();

	return await handleResponse(
		api.users(params)['mc-claims'].get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function verifyUserMcClaim(
	params: API.Users.VerifyMcClaim.Param,
	body: API.Users.VerifyMcClaim.Body,
) {
	const session = await readSession();

	return await handleResponse(
		api.users(params)['mc-claims'].post(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function deleteMcClaim(params: API.Users.RemoveMcClaim.Param) {
	const session = await readSession();

	return await handleResponse(
		api
			.users({ id: params.id })
			['mc-claims']({ mcClaimId: params.mcClaimId })
			.delete(
				{},
				{
					headers: { Authorization: `Bearer ${session.authToken}` },
				},
			),
	);
}

export async function updateMcClaim(
	params: API.Users.ModifyMcClaim.Param,
	body: API.Users.ModifyMcClaim.Body,
) {
	const session = await readSession();

	return await handleResponse(
		api
			.users({ id: params.id })
			['mc-claims']({ mcClaimId: params.mcClaimId })
			.patch(body, {
				headers: { Authorization: `Bearer ${session.authToken}` },
			}),
	);
}
