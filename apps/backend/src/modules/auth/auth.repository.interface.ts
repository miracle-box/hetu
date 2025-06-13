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

	/**
	 * Find a verification record by ID.
	 *
	 * @param id The verification ID
	 * @returns Either error or verification (null if not found)
	 */
	findVerificationById: (id: string) => Promise<Either<DatabaseError, Verification | null>>;

	/**
	 * Update a verification record by ID.
	 *
	 * @param id The verification ID
	 * @param params The parameters to update
	 * @returns Either error or verification
	 */
	updateVerificationById: (
		id: string,
		params: Partial<Pick<Verification, 'verified' | 'triesLeft' | 'secret' | 'expiresAt'>>,
	) => Promise<Either<DatabaseError, Verification>>;

	/**
	 * Revoke a verification record by ID.
	 *
	 * @param id The verification ID
	 */
	revokeVerificationById: (id: string) => Promise<Either<DatabaseError, void>>;
};
