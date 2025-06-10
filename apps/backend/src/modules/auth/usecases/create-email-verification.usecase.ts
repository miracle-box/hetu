import { EitherAsync, Left } from 'purify-ts';
import { PasswordService } from '~backend/services/auth/password';
import { MailingService } from '~backend/services/mailing';
import { UsersRepository } from '~backend/users/users.repository';
import {
	VERIFATION_EMAIL_EXPIRES_IN_MS,
	VERIFATION_EMAIL_TRIES,
	VERIFICATION_CODE_LENGTH,
} from '../auth.constants';
import { VerificationScenario, VerificationType } from '../auth.entities';
import { UserExistsError } from '../auth.errors';
import { generateVerificationCode } from '../auth.utils';
import { revokeAndCreateVerification } from '../services/verifications.service';

type Command = {
	scenario: Extract<
		VerificationScenario,
		typeof VerificationScenario.SIGNUP | typeof VerificationScenario.PASSWORD_RESET
	>;
	email: string;
};

export async function createEmailVerificationUsecase(cmd: Command) {
	const user = await UsersRepository.findByEmail(cmd.email);

	// Differentiate between scenarios
	const requiresNoUser = cmd.scenario === VerificationScenario.SIGNUP;
	const requiresUser = cmd.scenario === VerificationScenario.PASSWORD_RESET;

	if (requiresNoUser && user) return Left(new UserExistsError(cmd.email));

	// [TODO] Should be a service
	const code = generateVerificationCode(VERIFICATION_CODE_LENGTH);
	const hash = await PasswordService.hash(code);

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
				await MailingService.sendVerification(cmd.email, code, createdVerification);
			}
		})
		.map((createdVerification) => ({
			verification: createdVerification,
		}))
		.run();
}
