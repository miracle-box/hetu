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
