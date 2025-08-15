import { EitherAsync, Left } from 'purify-ts';
import { MailingService } from '#common/services/mailing';
import {
	VERIFATION_EMAIL_EXPIRES_IN_MS,
	VERIFATION_EMAIL_TRIES,
	VERIFICATION_CODE_LENGTH,
} from '#modules/auth/auth.constants';
import { VerificationScenario, VerificationType } from '#modules/auth/auth.entities';
import { UserExistsError } from '#modules/auth/auth.errors';
import { VerificationCodeService } from '#modules/auth/services/verification-code.service';
import { VerificationOperationService } from '#modules/auth/services/verification-operation.service';
import { UsersRepository } from '#modules/users/users.repository';
import { Logger } from '#shared/logger/index';

type Command = {
	scenario: Extract<
		VerificationScenario,
		typeof VerificationScenario.SIGNUP | typeof VerificationScenario.PASSWORD_RESET
	>;
	email: string;
};

export async function createEmailVerificationUsecase(cmd: Command) {
	const user = await UsersRepository.findUserByEmail(cmd.email);
	const userExists = user.isRight() && !!user.extract()?.id;

	// Differentiate between scenarios
	const requiresNoUser = cmd.scenario === VerificationScenario.SIGNUP;
	const requiresUser = cmd.scenario === VerificationScenario.PASSWORD_RESET;

	if (requiresNoUser && userExists) return Left(new UserExistsError(cmd.email));

	const { code, hash } = VerificationCodeService.generate(VERIFICATION_CODE_LENGTH);

	const userId = requiresUser ? (userExists ? user.extract()!.id : undefined) : undefined;

	return EitherAsync.fromPromise(
		async () =>
			await VerificationOperationService.revokeAndCreateVerification({
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
			if (requiresNoUser || (requiresUser && userExists)) {
				try {
					// [TODO] Waiting for new mailing module to be implemented
					await MailingService.sendVerification(cmd.email, code, createdVerification);
				} catch (error) {
					// Error is caught here because the mailer is not using Either right now.
					// Log the error but don't fail the verification creation
					Logger.error('Email sending failed, but verification was created:', {
						verificationId: createdVerification.id,
						email: cmd.email,
						error,
					});
					// Note: We continue without throwing, so the verification is still created
				}
			}
		})
		.map((createdVerification) => ({
			verification: createdVerification,
		}))
		.run();
}
