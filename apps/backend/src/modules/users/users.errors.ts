import { BaseError } from '#common/errors/base.error';

export class UserNotFoundError extends BaseError {
	override readonly name = 'UserNotFoundError' as const;

	constructor(userId: string) {
		super(`User not found: ${userId}`);
	}
}

export class McClaimNotFoundError extends BaseError {
	override readonly name = 'McClaimNotFoundError' as const;

	constructor(mcClaimId: string) {
		super(`MC Claim not found: ${mcClaimId}`);
	}
}

export class McApiAuthError extends BaseError {
	override readonly name = 'McApiAuthError' as const;

	constructor(message: string) {
		super(message);
	}
}

export class McClaimAlreadyExistsError extends BaseError {
	override readonly name = 'McClaimAlreadyExistsError' as const;

	constructor(mcUuid: string) {
		super(`MC Claim already exists for UUID: ${mcUuid}`);
	}
}

export class NoValidMcEntitlementError extends BaseError {
	override readonly name = 'NoValidMcEntitlementError' as const;

	constructor() {
		super('This user does not have valid Minecraft claims.');
	}
}
