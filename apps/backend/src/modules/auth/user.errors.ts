// ? Temp user errors

import { BaseError } from '~backend/common/errors/base.error';

export class UserNotFoundError extends BaseError {
	override readonly name = 'UserNotFoundError' as const;

	constructor(userId: string) {
		super(`User not found: ${userId}`);
	}
}
