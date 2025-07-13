import type { Verification } from '#modules/auth/auth.entities';
import { Left } from 'purify-ts';
import { InvalidVerificationCodeError } from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { VerificationCodeService } from '#modules/auth/services/verification-code.service';

type Command = {
	id: string;
	code: string;
	verification: Verification;
};

export async function verifyEmailVerificationUsecase(cmd: Command) {
	const codeCorrect = VerificationCodeService.verify(cmd.code, cmd.verification.secret);
	if (!codeCorrect) {
		await AuthRepository.updateVerificationById(cmd.id, {
			triesLeft: cmd.verification.triesLeft - 1,
		});
		return Left(new InvalidVerificationCodeError(cmd.id));
	}

	return (
		await AuthRepository.updateVerificationById(cmd.id, {
			verified: true,
		})
	).map((verification) => ({ verification }));
}
