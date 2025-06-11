import { EitherAsync, Left } from 'purify-ts';
import { MailingService } from '~backend/services/mailing';
import { UsersRepository } from '~backend/users/users.repository';
import {
	VERIFATION_EMAIL_EXPIRES_IN_MS,
	VERIFATION_EMAIL_TRIES,
	VERIFICATION_CODE_LENGTH,
} from '../auth.constants';
import { VerificationScenario, VerificationType } from '../auth.entities';
import { UserExistsError } from '../auth.errors';
import { revokeAndCreateVerification } from '../operations/verifications.operation';
import { VerificationCodeService } from '../services/verification-code.service';

type Command = {
	scenario: Extract<
		VerificationScenario,
		typeof VerificationScenario.SIGNUP | typeof VerificationScenario.PASSWORD_RESET
	>;
	email: string;
};

export async function createEmailVerificationUsecase(cmd: Command) {
	// [TODO] Waiting for users module to be implemented
	const user = await UsersRepository.findByEmail(cmd.email);

	// Differentiate between scenarios
	const requiresNoUser = cmd.scenario === VerificationScenario.SIGNUP;
	const requiresUser = cmd.scenario === VerificationScenario.PASSWORD_RESET;

	if (requiresNoUser && user) return Left(new UserExistsError(cmd.email));

	const { code, hash } = VerificationCodeService.generate(VERIFICATION_CODE_LENGTH);

	const userId = requiresUser ? user?.id : undefined;

	return EitherAsync.fromPromise(
		async () =>
			await revokeAndCreateVerification({
				type: VerificationType.EMAIL,
				scenario: cmd.scenario,
				target: cmd.email,
				secret: hash,
				expiresInMs: VERIFATION_EMAIL_EXPIRES_IN_MS,
				tries: VERIFATION_EMAIL_TRIES,
				userId,
			}),
	)
		.ifRight(async (createdVerification) => {
			if (requiresNoUser || (requiresUser && user)) {
				// [TODO] Waiting for new mailing module to be implemented
				await MailingService.sendVerification(cmd.email, code, createdVerification);
			}
		})
		.map((createdVerification) => ({
			verification: createdVerification,
		}))
		.run();
}
