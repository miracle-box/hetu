import { Elysia, t } from 'elysia';
import { verificationDigestSchema } from '~backend/auth/auth.entities';
import { AuthRepository } from '~backend/auth/auth.repository';
import { PasswordService } from '~backend/services/auth/password';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const verifyVerificationHandler = new Elysia().post(
	'/verification/verify',
	async ({ body }) => {
		const verif = await AuthRepository.findVerificationById(body.id);
		if (!verif) throw new AppError('auth/verification-not-exists');

		if (verif.expiresAt < new Date()) throw new AppError('auth/verification-expired');
		if (verif.triesLeft <= 0) throw new AppError('auth/verification-expired');
		if (verif.verified) throw new AppError('auth/verification-already-verified');

		const codeCorrect = await PasswordService.compare(body.code, verif.secret);
		if (!codeCorrect) {
			await AuthRepository.updateVerificationById(body.id, {
				triesLeft: verif.triesLeft - 1,
			});
			throw new AppError('auth/verification-invalid-code');
		}

		await AuthRepository.updateVerificationById(body.id, {
			verified: true,
		});

		return {
			verification: verif,
		};
	},
	{
		body: t.Object({
			id: t.String(),
			code: t.String(),
		}),
		response: {
			200: t.Object({
				verification: verificationDigestSchema,
			}),
			...createErrorResps(403, 404, 409, 410),
		},
		detail: {
			summary: 'Verify Verification',
			description: 'Verify the code sent to the user.',
			tags: ['Authentication'],
		},
	},
);
