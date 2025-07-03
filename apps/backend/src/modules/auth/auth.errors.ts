import { BaseError } from '../../common/errors/base.error';

export class UserExistsError extends BaseError {
	override readonly name = 'UserExistsError' as const;

	constructor(email: string) {
		super(`User with email ${email} already exists`);
	}
}

export class InvalidVerificationTypeError extends BaseError {
	override readonly name = 'InvalidVerificationTypeError' as const;

	constructor(provided: string) {
		super(`Invalid verification type: ${provided}`);
	}
}

export class InvalidVerificationScenarioError extends BaseError {
	override readonly name = 'InvalidVerificationScenarioError' as const;

	public acceptable: readonly string[];

	constructor(provided: string, acceptable: readonly string[]) {
		super(
			`Invalid verification scenario: ${provided}, acceptable scenarios: ${acceptable.join(', ')}`,
		);
		this.acceptable = acceptable;
	}
}

export class InvalidOauth2ProviderError extends BaseError {
	override readonly name = 'InvalidOauth2ProviderError' as const;

	constructor(provider: string) {
		super(`Invalid OAuth2 provider: ${provider}`);
	}
}

export class VerificationNotExistsError extends BaseError {
	override readonly name = 'VerificationNotExistsError' as const;

	constructor() {
		super(`Verification not exists.`);
	}
}

export class InvalidVerificationError extends BaseError {
	override readonly name = 'InvalidVerificationError' as const;

	constructor() {
		super(`Invalid verification.`);
	}
}

export class VerificationExpiredError extends BaseError {
	override readonly name = 'VerificationExpiredError' as const;

	constructor(id: string) {
		super(`Verification expired: ${id}`);
	}
}

export class VerificationAlreadyVerifiedError extends BaseError {
	override readonly name = 'VerificationAlreadyVerifiedError' as const;

	constructor(id: string) {
		super(`Verification already verified: ${id}`);
	}
}

export class InvalidVerificationCodeError extends BaseError {
	override readonly name = 'InvalidVerificationCodeError' as const;

	constructor(id: string) {
		super(`Invalid verification code for verification: ${id}`);
	}
}

export class InvalidOauth2GrantError extends BaseError {
	override readonly name = 'InvalidOauth2GrantError' as const;

	constructor(error: string, cause?: unknown) {
		super(`Failed to obtain access token or the token is invalid: ${error}`);
		if (cause) this.cause = cause;
	}
}

export class Oauth2MisconfiguredError extends BaseError {
	override readonly name = 'Oauth2MisconfiguredError' as const;

	constructor() {
		super('OAuth2 provider is misconfigured or returned invalid response');
	}
}

export class Oauth2AlreadyBoundError extends BaseError {
	override readonly name = 'Oauth2AlreadyBoundError' as const;

	constructor() {
		super('OAuth2 account is already bound to another user');
	}
}

export class Oauth2NotBoundError extends BaseError {
	override readonly name = 'Oauth2NotBoundError' as const;

	constructor() {
		super('OAuth2 account is not bound to any user');
	}
}

export class InvalidCredentialsError extends BaseError {
	override readonly name = 'InvalidCredentialsError' as const;

	constructor() {
		super('Invalid credentials provided');
	}
}

export class InvalidSessionError extends BaseError {
	override readonly name = 'InvalidSessionError' as const;

	constructor() {
		super('Invalid session');
	}
}
