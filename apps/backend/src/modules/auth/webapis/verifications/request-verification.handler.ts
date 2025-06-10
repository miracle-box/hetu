import { Elysia } from 'elysia';
import { VerificationType } from '~backend/auth/auth.entities';
import { Logger } from '~backend/shared/logger';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { requestVerificationAction } from '../../actions/verifications/request-verification.action';
import { requestVerificationDtoSchemas } from '../../dtos';

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
				if (data.type === VerificationType.EMAIL) {
					return {
						verification: {
							id: data.verification.id,
							type: VerificationType.EMAIL,
							scenario: data.verification.scenario,
							target: data.verification.target,
							verified: data.verification.verified,
						},
					};
				}

				if (data.type === VerificationType.OAUTH2) {
					return {
						verification: {
							id: data.verification.id,
							type: VerificationType.OAUTH2,
							scenario: data.verification.scenario,
							target: data.verification.target,
							// This is a OAuth2 specific field.
							challenge: data.challenge,
							verified: data.verification.verified,
						},
					};
				}

				// For type safety, should never happen.
				Logger.error('Invalid verification data, can not be mapped to response.', data);
				throw new AppError('auth/invalid-verification-type');
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
