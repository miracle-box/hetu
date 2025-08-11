'use server';

import { verifyUserMcClaim, getUserMcClaims } from '~web/libs/actions/api';
import { eitherToResp } from '~web/libs/utils/resp';

export async function handleVerifyUserMcClaim(body: { verificationId: string }) {
	return eitherToResp(await verifyUserMcClaim(body));
}

export async function handleGetUserMcClaims() {
	return eitherToResp(await getUserMcClaims());
}
