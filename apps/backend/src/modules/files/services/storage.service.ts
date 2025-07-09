import { HeadObjectCommand, PutObjectCommand, NotFound } from '@aws-sdk/client-s3';
import { Either, Left, Right } from 'purify-ts';
import { Config } from '~backend/shared/config';
import { s3 } from '~backend/shared/s3/client';
import { StorageError } from '../files.errors';

export type ObjectInfo = {
	hash: string;
	type: string;
	size: number;
};

export interface IStorageService {
	uploadFile(
		fileBuffer: Buffer,
		mimeType: string,
		hash: Buffer,
	): Promise<Either<StorageError, { size: number; type: string }>>;

	headObject(hash: string): Promise<Either<StorageError, ObjectInfo | null>>;

	getPublicUrl(hash: string): Either<StorageError, string>;
}

class StorageService implements IStorageService {
	private readonly bucket = Config.storage.s3.bucket;
	private readonly prefix = Config.storage.s3.prefix;

	private getObjectPath(hash: string) {
		return `${this.prefix}${hash.substring(0, 2)}/${hash}`;
	}

	private async putObject(fileBuf: Buffer, mimeType: string, hash: Buffer) {
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

	async uploadFile(fileBuffer: Buffer, mimeType: string, hash: Buffer) {
		try {
			const uploadedFile = await this.putObject(fileBuffer, mimeType, hash);
			return Right({ size: uploadedFile.size, type: uploadedFile.type });
		} catch (error) {
			return Left(new StorageError('Failed to upload file to storage.'));
		}
	}

	async headObject(hash: string) {
		try {
			const result = await s3
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

			return Right(result);
		} catch (error) {
			return Left(new StorageError('Failed to check object existence in storage.'));
		}
	}

	getPublicUrl(hash: string) {
		try {
			const url = `${Config.storage.s3.publicRoot}/${this.getObjectPath(hash)}`;
			return Right(url);
		} catch (error) {
			return Left(new StorageError('Failed to generate public URL.'));
		}
	}
}

export const storageService: IStorageService = new StorageService();
