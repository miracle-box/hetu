'use server';

import type { API } from '@repo/api-client';
import { readSession } from '../auth';
import * as users from './users';

/**
 * Wrapper functions for user-related API calls that automatically use the current user's ID.
 */

export async function getMyInfo() {
	const session = await readSession();
	return users.getUserInfo({ id: session.userId });
}

export async function getMyProfiles() {
	const session = await readSession();
	return users.getUserProfiles({ id: session.userId });
}

export async function getMyTextures() {
	const session = await readSession();
	return users.getUserTextures({ id: session.userId });
}

export async function getMyMcClaims() {
	const session = await readSession();
	return users.getUserMcClaims({ id: session.userId });
}

export async function verifyMyMcClaim(body: API.Users.VerifyMcClaim.Body) {
	const session = await readSession();
	return users.verifyUserMcClaim({ id: session.userId }, body);
}

export async function deleteMyMcClaim(params: Omit<API.Users.RemoveMcClaim.Param, 'id'>) {
	const session = await readSession();
	return users.deleteMcClaim({ id: session.userId, mcClaimId: params.mcClaimId });
}

export async function updateMyMcClaim(
	params: Omit<API.Users.ModifyMcClaim.Param, 'id'>,
	body: API.Users.ModifyMcClaim.Body,
) {
	const session = await readSession();
	return users.updateMcClaim({ id: session.userId, mcClaimId: params.mcClaimId }, body);
}
