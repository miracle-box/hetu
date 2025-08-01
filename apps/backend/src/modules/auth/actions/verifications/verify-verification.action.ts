import type { DatabaseError } from '#common/errors/base.error';
import type { Verification } from '#modules/auth/auth.entities';
import { Either, EitherAsync, Left } from 'purify-ts';
import { VerificationType } from '#modules/auth/auth.entities';
import {
	InvalidOauth2GrantError,
	InvalidOauth2ProviderError,
	InvalidVerificationCodeError,
	InvalidVerificationTypeError,
	Oauth2MisconfiguredError,
} from '#modules/auth/auth.errors';
import { AuthRepository } from '#modules/auth/auth.repository';
import { VerificationValidatorService } from '#modules/auth/services/verification-validator.service';
import { verifyEmailVerificationUsecase } from '#modules/auth/usecases/verifications/verify-email-verification.usecase';
import { verifyMcClaimMsaVerificationUsecase } from '#modules/auth/usecases/verifications/verify-mc-claim-msa-verification';
import { verifyOauth2VerificationUsecase } from '#modules/auth/usecases/verifications/verify-oauth2-verification';

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

				if (verification.type === VerificationType.MC_CLAIM_VERIFICATION_MSA) {
					return await verifyMcClaimMsaVerificationUsecase({
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
