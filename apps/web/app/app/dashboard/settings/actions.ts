'use server';

import { deleteMcClaim, updateMcClaim } from '~web/libs/actions/api';
import { eitherToResp } from '~web/libs/utils/resp';

export async function deleteClaimAction(mcClaimId: string) {
	const result = await deleteMcClaim(mcClaimId);
	return eitherToResp(result);
}

export async function updateClaimAction(
	mcClaimId: string,
	body: { boundProfileId?: string | null },
) {
	const result = await updateMcClaim(mcClaimId, body);
	return eitherToResp(result);
}

export async function getMcClaimsAction() {
	const { getUserMcClaims } = await import('~web/libs/actions/api');
	const result = await getUserMcClaims();
	return eitherToResp(result);
}
