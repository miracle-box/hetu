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
