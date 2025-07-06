import { BaseError } from '../../common/errors/base.error';

export class ProfileNotFoundError extends BaseError {
	override readonly name = 'ProfileNotFoundError' as const;

	constructor(profileId: string) {
		super(`Profile with ID ${profileId} not found.`);
	}
}

export class ProfileNameAlreadyExistsError extends BaseError {
	override readonly name = 'ProfileNameAlreadyExistsError' as const;

	constructor(name: string) {
		super(`Profile with name "${name}" already exists.`);
	}
}

export class PrimaryProfileAlreadyExistsError extends BaseError {
	override readonly name = 'PrimaryProfileAlreadyExistsError' as const;

	constructor(userId: string) {
		super(`User ${userId} already has a primary profile.`);
	}
}
