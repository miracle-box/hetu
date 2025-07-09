import { BaseError } from '../../common/errors/base.error';

export class TextureNotFoundError extends BaseError {
	override readonly name = 'TextureNotFoundError' as const;

	constructor(textureId: string) {
		super(`Texture with ID ${textureId} not found.`);
	}
}

export class TextureFileExistsForUserError extends BaseError {
	override readonly name = 'TextureFileExistsForUserError' as const;

	constructor(userId: string, type: string, hash: string) {
		super(`User ${userId} already has a texture of type ${type} with hash ${hash}.`);
	}
}

export class TextureImageError extends BaseError {
	override readonly name = 'TextureImageError' as const;

	constructor(message: string) {
		super(message);
	}
}
