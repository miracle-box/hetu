import sharp from 'sharp';
import { Texture } from '~/models/texture';
import { UploadRequest } from './textures.model';

export abstract class TexturesService {
	static isValidSkinDimensions(width: number, height: number): boolean {
		// Skin dims: n times of 64*64 or 64*32
		const whRatio = width / height;

		const isValidWidth = width % 64 === 0;
		const isValidRatio = whRatio === 1 || whRatio === 2;

		if (!isValidWidth || !isValidRatio) return false;
		return true;
	}

	static isValidCapeDimensions(width: number, height: number): false | 'vanilla' | 'optifine' {
		// Cape dims: n times of 64*32 or 22*17
		const whRatio = width / height;

		const isValid64x32 = width % 64 === 0 && whRatio === 2;
		const isValid22x17 = width % 22 === 0 && whRatio === 22 / 17;

		if (isValid64x32) return 'vanilla';
		if (isValid22x17) return 'optifine';
		return false;
	}

	static async normalizeImage(file: File, type: 'skin' | 'cape'): Promise<Buffer> {
		let image = sharp(await file.arrayBuffer(), {
			// [TODO] Configurable size limits
			limitInputPixels: 1024 * 1024,
		});

		const ogMeta = await image.metadata();
		// [TODO] All errors in one place.
		if (!ogMeta.width || !ogMeta.height) throw new Error("Image doesn't have dimensions");

		if (type === 'skin' && !this.isValidSkinDimensions(ogMeta.width, ogMeta.height))
			throw new Error('Invalid skin dimensions');
		if (type === 'cape') {
			const capeType = this.isValidCapeDimensions(ogMeta.width, ogMeta.height);
			if (!capeType) {
				throw new Error('Invalid cape dimensions');
			} else if (capeType === 'optifine') {
				// Pad OF capes to n times of 64x32 using transparent background
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
			image = image.ensureAlpha(0);
		}

		const output = image
			.png({
				force: true,
				adaptiveFiltering: false,
				compressionLevel: 9,
			})
			.toBuffer();

		return output;
	}

	static sha256Hash(buf: Buffer): string {
		const hasher = new Bun.CryptoHasher('sha256');

		hasher.update(buf);
		return hasher.digest().toString('hex');
	}
}
