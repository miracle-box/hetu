import { Elysia, t } from 'elysia';
import { verificationDigestSchema, VerificationType } from '~backend/auth/auth.entities';
import { AuthRepository } from '~backend/auth/auth.repository';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const inspectVerificationHandler = new Elysia().get(
	'/verification/:id',
	async ({ params }) => {
		const verif = await AuthRepository.findVerificationById(params.id);
		if (!verif) throw new AppError('auth/verification-not-exists');

		if (verif.expiresAt < new Date()) throw new AppError('auth/verification-expired');
		if (verif.triesLeft <= 0) throw new AppError('auth/verification-expired');

		if (verif.type === VerificationType.EMAIL)
			return {
				verification: {
					id: verif.id,
					type: VerificationType.EMAIL,
					scenario: verif.scenario,
					target: verif.target,
					verified: verif.verified,
				},
			};

		if (verif.type === VerificationType.OAUTH2)
			return {
				verification: {
					id: verif.id,
					type: VerificationType.EMAIL,
					scenario: verif.scenario,
					target: verif.target,
					challenge: null,
					verified: verif.verified,
				},
			};

		// Verification type have no handlers, consider as invalid here.
		throw new AppError('auth/invalid-verification');
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		response: {
			200: t.Object({
				verification: verificationDigestSchema,
			}),
			...createErrorResps(400, 404, 410),
		},
		detail: {
			summary: 'Inspect Verification',
			description: 'Get verification info without touching it.',
			tags: ['Authentication'],
		},
	},
);
