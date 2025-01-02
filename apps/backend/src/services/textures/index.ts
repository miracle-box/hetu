import { TextureType } from '~backend/textures/texture.entities';
import sharp from 'sharp';
import { EnumLikeValues } from '~backend/shared/typing/utils';

export const CapeType = {
	VANILLA: 'vanilla',
	LEGACY: 'legacy',
} as const;

export type CapeType = EnumLikeValues<typeof CapeType>;

export abstract class TexturesService {
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

	static async normalizeImage(file: Blob, type: TextureType): Promise<Buffer> {
		let image = sharp(await file.arrayBuffer(), {
			// [TODO] Configurable size limits
			limitInputPixels: 512 * 256,
		});

		const ogMeta = await image.metadata();
		if (!ogMeta.width || !ogMeta.height) throw new Error("Image doesn't have dimensions");

		if (
			(type === TextureType.SKIN || type === TextureType.SKIN_SLIM) &&
			!this.isValidSkinDimensions(ogMeta.width, ogMeta.height)
		)
			throw new Error('Invalid skin dimensions');
		if (type === TextureType.CAPE) {
			const capeType = this.isValidCapeDimensions(ogMeta.width, ogMeta.height);
			if (!capeType) {
				throw new Error('Invalid cape dimensions');
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

		return image
			.png({
				force: true,
				adaptiveFiltering: false,
				compressionLevel: 9,
			})
			.toBuffer();
	}
}
