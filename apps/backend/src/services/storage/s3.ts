import { Static, t } from 'elysia';
import { s3 } from '~backend/shared/s3/client';
import { HeadObjectCommand, PutObjectCommand, NotFound } from '@aws-sdk/client-s3';

// Entities
export const objectInfoSchema = t.Object({
	hash: t.String(),
	type: t.String(),
	size: t.Number(),
});
export type ObjectInfo = Static<typeof objectInfoSchema>;

// [TODO] Needs better implementation, for more feature (pre signed URLs, etc), multi bucket support, etc.
export class S3StorageService {
	private readonly bucket = process.env.S3_BUCKET;
	private readonly prefix = process.env.S3_PREFIX;

	private getObjectPath(hash: string) {
		return `${this.prefix}${hash.substring(0, 2)}/${hash}`;
	}

	async headObject(hash: string): Promise<ObjectInfo | null> {
		return await s3
			.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: this.getObjectPath(hash),
				}),
			)
			.then((res) => ({
				hash,
				// S3 will return type and size
				type: res.ContentType!,
				size: res.ContentLength!,
			}))
			.catch((e) => {
				if (e instanceof NotFound) return null;
				throw e;
			});
	}

	async putObject(fileBuf: Buffer, mimeType: string, hash: Buffer): Promise<ObjectInfo> {
		const hashHex = hash.toString('hex');
		const hashB64 = hash.toString('base64');

		// Return existing objects first.
		const existingFile = await s3
			.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: this.getObjectPath(hashHex),
				}),
			)
			.then((res) => ({
				hash: hashHex,
				// S3 will return type and size
				type: res.ContentType!,
				size: res.ContentLength!,
			}))
			.catch((e) => {
				if (e instanceof NotFound) return null;
				throw e;
			});
		if (existingFile) return existingFile;

		// Put new object if not have one.
		await s3.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: this.getObjectPath(hashHex),
				Body: fileBuf,
				ContentType: mimeType,
				ContentLength: fileBuf.byteLength,
				ChecksumSHA256: hashB64,
			}),
		);

		return {
			hash: hashHex,
			type: mimeType,
			size: fileBuf.byteLength,
		};
	}

	// [TODO] Maybe put this into files module
	getPublicUrl(hash: string): string {
		return `${process.env.S3_PUBLIC_ROOT}/${this.getObjectPath(hash)}`;
	}
}
