import type { VerificationScenario, VerificationType } from '../auth.entities';
import { EitherAsync } from 'purify-ts';
import { withTransaction } from '~backend/shared/db';
import { AuthRepository } from '../auth.repository';

type Command = {
	userId?: string;
	type: VerificationType;
	scenario: VerificationScenario;
	target: string;
	secret: string;
	expiresInMs: number;
	tries: number;
};

export async function revokeAndCreateVerification(cmd: Command) {
	return await withTransaction(async () => {
		return EitherAsync.fromPromise(() =>
			AuthRepository.revokeVerifications({
				scenario: cmd.scenario,
				target: cmd.target,
			}),
		)
			.chain(() =>
				EitherAsync.fromPromise(() =>
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
				),
			)
			.run();
	});
}
