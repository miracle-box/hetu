import { Elysia } from 'elysia';
import { VerificationType } from '~backend/auth/auth.entities';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { inspectVerificationAction } from '../../actions/verifications/inspect-verification.action';
import { inspectVerificationDtoSchemas } from '../../dtos';

export const inspectVerificationHandler = new Elysia().get(
	'/verification/:id',
	async ({ params }) => {
		const result = await inspectVerificationAction({ id: params.id });

		return result
			.map((data) => {
				if (data.verification.type === VerificationType.OAUTH2) {
					return {
						verification: {
							id: data.verification.id,
							type: VerificationType.OAUTH2,
							scenario: data.verification.scenario,
							target: data.verification.target,
							// This is a OAuth2 specific field.
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
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...inspectVerificationDtoSchemas,
		detail: {
			summary: 'Inspect Verification',
			description: 'Get verification info without touching it.',
			tags: ['Authentication'],
		},
	},
);
