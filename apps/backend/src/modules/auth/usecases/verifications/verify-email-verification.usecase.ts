import type { Verification } from '../../auth.entities';
import { Left } from 'purify-ts';
import { InvalidVerificationCodeError } from '../../auth.errors';
import { AuthRepository } from '../../auth.repository';
import { VerificationCodeService } from '../../services/verification-code.service';

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
