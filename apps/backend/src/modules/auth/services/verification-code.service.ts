import { randomInt, randomBytes } from 'crypto';

export abstract class VerificationCodeService {
	static generate(length: number): {
		code: string;
		hash: string;
	} {
		const code = randomInt(0, 10 ** length)
			.toString()
			.padStart(length, '0');

		const salt = randomBytes(16).toString('hex');

		const hasher = new Bun.CryptoHasher('sha256');
		hasher.update(salt + code);
		const hash = hasher.digest('base64');

		return { code, hash: `${salt}:${hash}` };
	}

	static verify(code: string, saltedHash: string): boolean {
		const [salt, hash] = saltedHash.split(':');

		const hasher = new Bun.CryptoHasher('sha256');
		hasher.update(salt + code);
		const providedHash = hasher.digest('base64');

		return hash === providedHash;
	}
}
