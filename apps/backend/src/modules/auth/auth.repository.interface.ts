import type { Verification, Session, SessionMetadata } from './auth.entities';
import type { DatabaseError } from '~backend/common/errors/base.error';
import { Either } from 'purify-ts';

export type IAuthRepository = {
	/**
	 * Get password hash for a user.
	 *
	 * @param userId The user ID
	 * @returns Either error or password hash (null if not found)
	 */
	getPassword: (userId: string) => Promise<Either<DatabaseError, string | null>>;

	/**
	 * Upsert password for a user.
	 *
	 * @param params The password parameters
	 */
	upsertPassword: (params: {
		userId: string;
		passwordHash: string;
	}) => Promise<Either<DatabaseError, void>>;

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
	 * Find a verified verification record by ID and scenario.
	 *
	 * @param id The verification ID
	 * @param scenario The verification scenario
	 * @returns Either error or verification (null if not found)
	 */
	findVerifiedVerification: (
		id: string,
		scenario: Verification['scenario'],
	) => Promise<Either<DatabaseError, Verification | null>>;

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

	/**
	 * Find OAuth2 binding by provider and profile ID.
	 *
	 * @param provider The OAuth2 provider name
	 * @param profileId The OAuth2 profile ID
	 * @returns Either error or OAuth2 binding (null if not found)
	 */
	findOAuth2Binding: (
		provider: string,
		profileId: string,
	) => Promise<
		Either<
			DatabaseError,
			{
				userId: string;
				provider: string | null;
				profileId: string;
			} | null
		>
	>;

	/**
	 * Upsert OAuth2 binding.
	 *
	 * @param params The OAuth2 binding parameters
	 */
	upsertOAuth2: (params: {
		userId: string;
		provider: string;
		oauth2ProfileId: string;
		metadata: { accessToken: string };
	}) => Promise<Either<DatabaseError, void>>;

	/**
	 * Find a session by ID.
	 *
	 * @param sessionId The session ID
	 * @returns Either error or session (null if not found)
	 */
	findSessionById: (sessionId: string) => Promise<Either<DatabaseError, Session | null>>;

	/**
	 * Find all sessions for a user.
	 *
	 * @param userId The user ID
	 * @returns Either error or sessions array
	 */
	findSessionsByUser: (userId: string) => Promise<Either<DatabaseError, Session[]>>;

	/**
	 * Revoke a session by ID.
	 *
	 * @param sessionId The session ID
	 */
	revokeSessionById: (sessionId: string) => Promise<Either<DatabaseError, void>>;

	/**
	 * Revoke all sessions for a user.
	 *
	 * @param userId The user ID
	 */
	revokeSessionsByUser: (userId: string) => Promise<Either<DatabaseError, void>>;

	/**
	 * Create a new session.
	 *
	 * @param params The session parameters
	 */
	createSession: (params: {
		userId: string;
		metadata: SessionMetadata;
	}) => Promise<Either<DatabaseError, Session>>;

	/**
	 * Update a session by ID.
	 *
	 * @param sessionId The session ID
	 * @param params The parameters to update
	 */
	updateSession: (
		sessionId: string,
		params: {
			updatedAt: Date;
		},
	) => Promise<Either<DatabaseError, Session>>;
};
