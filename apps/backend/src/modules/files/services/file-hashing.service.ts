import { CryptoHasher } from 'bun';

export class FileHashingService {
	static hashSha256(data: Buffer): string {
		const hash = CryptoHasher.hash('sha256', data);
		return hash.toString('hex');
	}
}
