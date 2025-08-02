/**
 * Length of the verification code.
 */
export const VERIFICATION_CODE_LENGTH = 8;

/**
 * Expiration time of the verification email in milliseconds.
 */
export const VERIFATION_EMAIL_EXPIRES_IN_MS = 1000 * 60 * 10;

/**
 * Number of tries for the verification email.
 */
export const VERIFATION_EMAIL_TRIES = 3;

/**
 * Expiration time of the OAuth2 verification in milliseconds.
 */
export const VERIFICATION_OAUTH2_EXPIRES_IN_MS = 1000 * 60 * 10;

/**
 * Number of tries for the OAuth2 verification.
 *
 * ? This is not actually used, but database schema requires it.
 */
export const VERIFICATION_OAUTH2_TRIES = 1;

/**
 * Target field of MSA verification for verifying Minecraft claims.
 *
 * ? This is not actually used, but database schema requires it.
 */
export const VERIFICATION_MC_CLAIM_MSA_TARGET = 'msa';

/**
 * Token endpoint for MSA verification for verifying Minecraft claims.
 */
export const VERIFICATION_MC_CLAIM_MSA_TOKEN_ENDPOINT =
	'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';

/**
 * Scope for MSA verification for verifying Minecraft claims.
 */
export const VERIFICATION_MC_CLAIM_MSA_SCOPE = 'XboxLive.signin';
