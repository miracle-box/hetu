import { randomBytes, createHash } from 'node:crypto';

export class PKCEService {
	static generateChallenge(method: 'S256' | 'plain' | false): {
		verifier: string;
		challenge: string | null;
	} {
		// PKCE is not required for the provider
		if (!method) {
			return { verifier: '', challenge: null };
		}

		const verifier = randomBytes(32).toString('base64url');

		const challenge =
			method === 'S256'
				? // S256
					createHash('sha256').update(verifier).digest('base64url')
				: // Plain
					verifier;

		return { verifier, challenge };
	}
}
