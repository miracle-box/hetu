import { BaseError } from '#common/errors/base.error';

export class FileNotFoundError extends BaseError {
	override readonly name = 'FileNotFoundError' as const;

	constructor(fileId: string) {
		super(`File with ID ${fileId} not found.`);
	}
}

export class FileUploadError extends BaseError {
	override readonly name = 'FileUploadError' as const;

	constructor(message: string) {
		super(message);
	}
}

export class InvalidFileTypeError extends BaseError {
	override readonly name = 'InvalidFileTypeError' as const;

	constructor(fileType: string) {
		super(`Invalid file type: ${fileType}`);
	}
}

export class StorageError extends BaseError {
	override readonly name = 'StorageError' as const;

	constructor(message: string) {
		super(message);
	}
}
