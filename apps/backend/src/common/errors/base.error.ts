export abstract class BaseError extends Error {
	override readonly name = this.constructor.name;

	constructor(
		message: string,
		public readonly details?: Record<string, unknown>,
	) {
		super(message);
	}
}

export class DatabaseError extends BaseError {
	override readonly name = 'DatabaseError' as const;

	constructor(message: string, cause: unknown) {
		super(message);
		this.cause = cause;
	}
}
