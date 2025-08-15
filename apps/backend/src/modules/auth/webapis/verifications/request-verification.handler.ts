import { Elysia } from 'elysia';
import { requestVerificationAction } from '#modules/auth/actions/verifications/request-verification.action';
import { VerificationType } from '#modules/auth/auth.entities';
import { requestVerificationDtoSchemas } from '#modules/auth/dtos';
import { AppError } from '#shared/middlewares/errors/app-error';

export const requestVerificationHandler = new Elysia().post(
	'/verification/request',
	async ({ body }) => {
		const result = await requestVerificationAction({
			type: body.type,
			scenario: body.scenario,
			target: body.target,
		});

		return result
			.map((data) => {
				if (
					data.type === VerificationType.OAUTH2 ||
					data.type === VerificationType.MC_CLAIM_VERIFICATION_MSA
				) {
					return {
						verification: {
							id: data.verification.id,
							type: data.type,
							scenario: data.verification.scenario,
							target: data.verification.target,
							// This is a OAuth2 specific field.
							challenge: data.challenge,
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
					case 'UserExistsError':
						throw new AppError('auth/user-exists');
					case 'InvalidVerificationScenarioError':
						throw new AppError('auth/invalid-verification-scenario');
					case 'InvalidOauth2ProviderError':
						throw new AppError('auth/invalid-oauth2-provider');
					case 'InvalidVerificationTypeError':
						throw new AppError('auth/invalid-verification-type');
					case 'InvalidVerificationTargetError':
						throw new AppError('auth/invalid-verification-target');
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...requestVerificationDtoSchemas,
		detail: {
			summary: 'Request Verification',
			description: 'Request sending verification codes to the user.',
			tags: ['Authentication'],
		},
	},
);
