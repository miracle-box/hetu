import { AuthRepository } from '#modules/auth/auth.repository';
import { VerificationValidatorService } from '#modules/auth/services/verification-validator.service';

type Command = {
	id: string;
};

export async function inspectVerificationAction(cmd: Command) {
	const verificationRecord = await AuthRepository.findVerificationById(cmd.id);

	return verificationRecord
		.chain((verification) => VerificationValidatorService.validateForInspect(verification))
		.map((verification) => {
			return { verification };
		});
}
