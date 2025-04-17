'use server';

import { requestVerification } from '~web/libs/actions/api';
import { eitherToResp } from '~web/libs/forms/responses';

export async function handleRequestVerification(params: {
	// [TODO] Share common types between frontend and backend.
	type: 'email';
	scenario: 'signup' | 'password_reset';
	target: string;
}) {
	const resp = await requestVerification(params);
	return eitherToResp(resp);
}
