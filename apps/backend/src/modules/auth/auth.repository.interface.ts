import type { Verification } from './auth.entities';
import type { DatabaseError } from '~backend/common/errors/base.error';
import { Either } from 'purify-ts';

export type IAuthRepository = {
	/**
	 * Create a verification record.
	 *
	 * @param params
	 */
	createVerification: (
		params: Pick<
			Verification,
			'type' | 'scenario' | 'target' | 'secret' | 'verified' | 'triesLeft' | 'expiresAt'
		> & { userId?: string },
	) => Promise<Either<DatabaseError, Verification>>;

	/**
	 * Revoke verifications for a specific target in a scenario.
	 *
	 * ! Do not use this for OAuth verifications, their `target` only indicates the provider!
	 *
	 * @param params
	 */
	revokeVerifications: (
		params: Pick<Verification, 'scenario' | 'target'>,
	) => Promise<Either<DatabaseError, void>>;
};
