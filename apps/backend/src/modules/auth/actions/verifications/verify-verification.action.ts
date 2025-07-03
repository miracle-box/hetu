import type { Verification } from '~backend/auth/auth.entities';
import type { DatabaseError } from '~backend/common/errors/base.error';
import { Either, EitherAsync, Left } from 'purify-ts';
import { VerificationType } from '../../auth.entities';
import {
	InvalidOauth2GrantError,
	InvalidOauth2ProviderError,
	InvalidVerificationCodeError,
	InvalidVerificationTypeError,
	Oauth2MisconfiguredError,
} from '../../auth.errors';
import { AuthRepository } from '../../auth.repository';
import { VerificationValidatorService } from '../../services/verification-validator.service';
import { verifyEmailVerificationUsecase } from '../../usecases/verifications/verify-email-verification.usecase';
import { verifyOauth2VerificationUsecase } from '../../usecases/verifications/verify-oauth2-verification';

type Command = {
	id: string;
	code: string;
	redirectUri?: string;
};

export async function verifyVerificationAction(cmd: Command) {
	const verificationRecord = await AuthRepository.findVerificationById(cmd.id);

	return EitherAsync.liftEither(verificationRecord)
		.chain(async (verification) => VerificationValidatorService.validateForVerify(verification))
		.chain(
			async (
				verification,
			): Promise<
				Either<
					// Sadly TypeScript does not recognize
					// Either<L1, never> | Either<L2, R> as Either<L1 | L2, R>
					| InvalidVerificationCodeError
					| InvalidVerificationTypeError
					| InvalidOauth2GrantError
					| InvalidOauth2ProviderError
					| Oauth2MisconfiguredError
					| DatabaseError,
					{ verification: Verification }
				>
			> => {
				if (verification.type === VerificationType.EMAIL) {
					return await verifyEmailVerificationUsecase({
						id: verification.id,
						code: cmd.code,
						verification,
					});
				}

				if (verification.type === VerificationType.OAUTH2) {
					return await verifyOauth2VerificationUsecase({
						id: verification.id,
						code: cmd.code,
						verification,
						redirectUri: cmd.redirectUri,
					});
				}

				return Left(new InvalidVerificationTypeError(verification.type));
			},
		)
		.run();
}
