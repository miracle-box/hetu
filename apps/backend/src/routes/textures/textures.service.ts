import sharp from 'sharp';
import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Texture } from '~/models/texture';
import { UploadRequest } from './textures.model';
import { s3 } from '~/s3/client';
import { db } from '~/db/connection';
import { textureTable } from '~/db/schema/texture';

export abstract class TexturesService {
	static isValidSkinDimensions(width: number, height: number): boolean {
		// Skin dims: n times of 64*64 or 64*32
		const whRatio = width / height;

		const isValidWidth = width % 64 === 0;
		const isValidRatio = whRatio === 1 || whRatio === 2;

		if (!isValidWidth || !isValidRatio) return false;
		return true;
	}

	static isValidCapeDimensions(width: number, height: number): false | 'vanilla' | 'legacy' {
		// Cape dims: n times of 64*32 or 22*17
		const whRatio = width / height;

		const isValid64x32 = width % 64 === 0 && whRatio === 2;
		const isValid22x17 = width % 22 === 0 && whRatio === 22 / 17;

		if (isValid64x32) return 'vanilla';
		if (isValid22x17) return 'legacy';
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
			} else if (capeType === 'legacy') {
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

	static sha256Hash(buf: Buffer): Buffer {
		const hasher = new Bun.CryptoHasher('sha256');

		hasher.update(buf);
		return hasher.digest();
	}

	static async uploadToS3(file: Buffer, sha256sum: Buffer): Promise<void> {
		const hashHex = sha256sum.toString('hex');
		const hashBase64 = sha256sum.toString('base64');

		// Put textures in textures/(first two letters of hash)/(hash)
		const fileKey = `textures/${hashHex.slice(0, 2)}/${hashHex}`;

		const fileExists = await s3
			.send(
				new HeadObjectCommand({
					Bucket: process.env.S3_BUCKET,
					Key: fileKey,
				}),
			)
			.then(() => true)
			.catch((reason: Error) => {
				if (reason.name === 'NotFound') return false;
				throw reason;
			});

		if (!fileExists) {
			const res = await s3.send(
				new PutObjectCommand({
					Bucket: process.env.S3_BUCKET,
					Key: `textures/${hashHex.slice(0, 2)}/${hashHex}`,
					Body: file,
					ContentType: 'image/png',
					ChecksumSHA256: hashBase64,
				}),
			);
		}
	}

	static async createTexture(authorId: string, body: UploadRequest): Promise<Texture> {
		const skinOrCape = body.type === 'cape' ? 'cape' : 'skin';
		const image = await this.normalizeImage(body.image, skinOrCape);
		const hash = this.sha256Hash(image);

		// [TODO] Manage errors in one place
		await this.uploadToS3(image, hash).catch((reason: Error) => {
			throw new Error(`Failed to upload texture: ${reason.message}`);
		});

		const [insertedTexture] = await db
			.insert(textureTable)
			.values({
				authorId,
				name: body.name,
				description: body.description,
				type: body.type,
				hash: hash.toString('hex'),
			})
			.returning();

		// [TODO] Check if it's possible to do this in one query
		if (!insertedTexture) throw new Error('Failed to create texture');

		return insertedTexture;
	}
}
