import { BaseError } from '../../common/errors/base.error';

export class TextureNotFoundError extends BaseError {
	override readonly name = 'TextureNotFoundError' as const;

	constructor(textureId: string) {
		super(`Texture with ID ${textureId} not found.`);
	}
}

export class TextureAlreadyExistsError extends BaseError {
	override readonly name = 'TextureAlreadyExistsError' as const;

	constructor(userId: string, type: string, hash: string) {
		super(`User ${userId} already has a texture of type ${type} with hash ${hash}.`);
	}
}
