'use server';

import type { API } from '@repo/api-client';
import { client as api } from '~web/libs/api/eden';
import { handleResponse } from '~web/libs/utils/api-response';
import { readSession } from '../auth';

export async function getUserInfo() {
	const session = await readSession();

	return handleResponse(
		api
			.users({
				id: session.userId,
			})
			.get({
				headers: { Authorization: `Bearer ${session.authToken}` },
			}),
	);
}

export async function getUserProfiles() {
	const session = await readSession();

	return handleResponse(
		api
			.users({
				id: session.userId,
			})
			.profiles.get({
				headers: { Authorization: `Bearer ${session.authToken}` },
			}),
	);
}

export async function getUserTextures() {
	const session = await readSession();

	return handleResponse(
		api
			.users({
				id: session.userId,
			})
			.textures.get({
				headers: { Authorization: `Bearer ${session.authToken}` },
			}),
	);
}

export async function getUserMcClaims() {
	const session = await readSession();

	return handleResponse(
		api.users({ id: session.userId })['mc-claims'].get({
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function verifyUserMcClaim(body: API.Users.VerifyMcClaim.Body) {
	const session = await readSession();

	return handleResponse(
		api.users({ id: session.userId })['mc-claims'].post(body, {
			headers: { Authorization: `Bearer ${session.authToken}` },
		}),
	);
}

export async function deleteMcClaim(params: API.Users.RemoveMcClaim.Param) {
	const session = await readSession();

	return handleResponse(
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

	return handleResponse(
		api
			.users({ id: params.id })
			['mc-claims']({ mcClaimId: params.mcClaimId })
			.patch(body, {
				headers: { Authorization: `Bearer ${session.authToken}` },
			}),
	);
}
