import type { TextureType } from '#modules/textures/textures.entities';
import { Either, Left, Right } from 'purify-ts';
import { TextureImageError } from '#modules/textures/textures.errors';

export enum CapeType {
	VANILLA = 'vanilla',
	LEGACY = 'legacy',
}

export class TextureImageService {
	static isValidSkinDimensions(width: number, height: number): boolean {
		// Skin dims: n times of 64*64 or 64*32
		const whRatio = width / height;

		const isValidWidth = width % 64 === 0;
		const isValidRatio = whRatio === 1 || whRatio === 2;

		return isValidWidth && isValidRatio;
	}

	static isValidCapeDimensions(width: number, height: number): false | CapeType {
		// Cape dims: n times of 64*32 or 22*17
		const whRatio = width / height;

		const isValid64x32 = width % 64 === 0 && whRatio === 2;
		if (isValid64x32) return CapeType.VANILLA;

		const isValid22x17 = width % 22 === 0 && whRatio === 22 / 17;
		if (isValid22x17) return CapeType.LEGACY;

		return false;
	}

	static async normalizeImage(
		file: Blob,
		type: TextureType,
	): Promise<Either<TextureImageError, Buffer>> {
		try {
			const sharp = await import('sharp');
			let image = sharp.default(await file.arrayBuffer(), {
				// [TODO] Configurable size limits
				limitInputPixels: 512 * 256,
			});

			const ogMeta = await image.metadata();
			if (!ogMeta.width || !ogMeta.height) {
				return Left(new TextureImageError("Image doesn't have dimensions"));
			}

			if (
				(type === 'skin' || type === 'skin_slim') &&
				!this.isValidSkinDimensions(ogMeta.width, ogMeta.height)
			) {
				return Left(new TextureImageError('Invalid skin dimensions'));
			}

			if (type === 'cape') {
				const capeType = this.isValidCapeDimensions(ogMeta.width, ogMeta.height);
				if (!capeType) {
					return Left(new TextureImageError('Invalid cape dimensions'));
				} else if (capeType === CapeType.LEGACY) {
					// Pad legacy capes to n times of 64x32 using transparent background
					const nTimesResolution = ogMeta.width / 22;
					image = image.extend({
						top: 0,
						left: 0,
						bottom: nTimesResolution * 32 - ogMeta.height,
						right: nTimesResolution * 64 - ogMeta.width,
						background: { r: 0, g: 0, b: 0, alpha: 0 },
					});
				}
			}

			if (!ogMeta.hasAlpha) {
				image = image.ensureAlpha(1);
			}

			const buffer = await image
				.png({
					force: true,
					adaptiveFiltering: false,
					compressionLevel: 9,
				})
				.toBuffer();

			return Right(buffer);
		} catch (error) {
			return Left(
				new TextureImageError(
					`Failed to normalize image: ${error instanceof Error ? error.message : 'Unknown error'}`,
				),
			);
		}
	}
}
