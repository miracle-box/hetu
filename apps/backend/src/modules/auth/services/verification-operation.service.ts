import type { VerificationScenario, VerificationType } from '#modules/auth/auth.entities';
import { EitherAsync } from 'purify-ts';
import { withTransaction } from '#db';
import { AuthRepository } from '#modules/auth/auth.repository';

export abstract class VerificationOperationService {
	static async revokeAndCreateVerification(cmd: {
		userId?: string;
		type: VerificationType;
		scenario: VerificationScenario;
		target: string;
		secret: string;
		expiresInMs: number;
		tries: number;
	}) {
		return await withTransaction(async () => {
			return EitherAsync.fromPromise(() =>
				AuthRepository.revokeVerifications({
					scenario: cmd.scenario,
					target: cmd.target,
				}),
			)
				.chain(() =>
					AuthRepository.createVerification({
						userId: cmd.userId,
						type: cmd.type,
						scenario: cmd.scenario,
						expiresAt: new Date(Date.now() + cmd.expiresInMs),
						target: cmd.target,
						secret: cmd.secret,
						verified: false,
						triesLeft: cmd.tries,
					}),
				)
				.run();
		});
	}
}
