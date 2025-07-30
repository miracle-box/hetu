import { Elysia } from 'elysia';
import { verifyVerificationAction } from '#modules/auth/actions/verifications/verify-verification.action';
import { VerificationType } from '#modules/auth/auth.entities';
import { verifyVerificationDtoSchemas } from '#modules/auth/dtos';
import { AppError } from '#shared/middlewares/errors/app-error';

export const verifyVerificationHandler = new Elysia().post(
	'/verification/verify',
	async ({ body }) => {
		const result = await verifyVerificationAction({
			id: body.id,
			code: body.code,
			redirectUri: body.redirectUri,
		});

		return result
			.map((data) => {
				if (
					data.verification.type === VerificationType.OAUTH2 ||
					data.verification.type === VerificationType.MC_CLAIM_VERIFICATION_MSA
				) {
					return {
						verification: {
							id: data.verification.id,
							type: data.verification.type,
							scenario: data.verification.scenario,
							target: data.verification.target,
							challenge: null,
							verified: data.verification.verified,
						},
					};
				}

				return {
					verification: data.verification,
				};
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'VerificationNotExistsError':
						throw new AppError('auth/verification-not-exists');
					case 'VerificationExpiredError':
						throw new AppError('auth/verification-expired');
					case 'InvalidVerificationCodeError':
						throw new AppError('auth/verification-invalid-code');
					case 'VerificationAlreadyVerifiedError':
						throw new AppError('auth/verification-already-verified');
					case 'InvalidVerificationTypeError':
						throw new AppError('auth/invalid-verification-type');
					case 'InvalidOauth2GrantError':
						throw new AppError('auth/invalid-oauth2-grant');
					case 'InvalidOauth2ProviderError':
						throw new AppError('auth/invalid-oauth2-provider');
					case 'Oauth2MisconfiguredError':
						throw new AppError('auth/oauth2-misconfigured');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...verifyVerificationDtoSchemas,
		detail: {
			summary: 'Verify Verification',
			description: 'Verify the code sent to the user.',
			tags: ['Authentication'],
		},
	},
);
