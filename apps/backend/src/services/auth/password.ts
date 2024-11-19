export abstract class PasswordService {
	static async hash(password: string): Promise<string> {
		// From OWASP Cheatsheet recommendations
		return await Bun.password.hash(password, {
			algorithm: 'argon2id',
			timeCost: 2,
			memoryCost: 19456,
		});
	}

	static async compare(password: string, hash: string): Promise<boolean> {
		return await Bun.password.verify(password, hash);
	}
}
