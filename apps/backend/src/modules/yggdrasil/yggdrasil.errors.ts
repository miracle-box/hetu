import { BaseError } from '#common/errors/base.error';

export class YggdrasilAuthenticationError extends BaseError {
	override readonly name = 'YggdrasilAuthenticationError' as const;

	constructor(message: string) {
		super(message);
	}
}

export class YggdrasilInvalidCredentialsError extends BaseError {
	override readonly name = 'YggdrasilInvalidCredentialsError' as const;

	constructor() {
		super('Invalid credentials');
	}
}

export class YggdrasilForbiddenError extends BaseError {
	override readonly name = 'YggdrasilForbiddenError' as const;

	constructor(message: string) {
		super(message);
	}
}

export class YggdrasilProfileNotFoundError extends BaseError {
	override readonly name = 'YggdrasilProfileNotFoundError' as const;

	constructor(idOrName: string) {
		super(`Profile with ID or name ${idOrName} not found.`);
	}
}

export class YggdrasilServerSessionNotFoundError extends BaseError {
	override readonly name = 'YggdrasilServerSessionNotFoundError' as const;

	constructor(serverId: string) {
		super(`Server session with ID ${serverId} not found.`);
	}
}

export class YggdrasilTextureError extends BaseError {
	override readonly name = 'YggdrasilTextureError' as const;

	constructor(message: string) {
		super(message);
	}
}
