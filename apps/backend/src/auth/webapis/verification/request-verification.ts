import { randomInt } from 'node:crypto';
import { Elysia, t } from 'elysia';
import {
	verificationDigestSchema,
	verificationScenarioSchema,
	VerificationType,
	verificationTypeSchema,
} from '~backend/auth/auth.entities';
import { AuthRepository } from '~backend/auth/auth.repository';
import { PasswordService } from '~backend/services/auth/password';
import { MailingService } from '~backend/services/mailing';
import { Logger } from '~backend/shared/logger';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const requestVerificationHandler = new Elysia().post(
	'/verification/request',
	async ({ body }) => {
		if (body.type === VerificationType.EMAIL) {
			const code = randomInt(0, 10 ** 8)
				.toString()
				.padStart(8, '0');
			const codeHash = await PasswordService.hash(code);

			const verif = await AuthRepository.createVerification({
				type: body.type,
				scenario: body.scenario,
				// [TODO] Should be configurable (now 10 minutes)
				expiresAt: new Date(Date.now() + 1000 * 60 * 10),
				target: body.target,
				secret: codeHash,
				verified: false,
				// [TODO] Manage in a centralized way
				triesLeft: 3,
			});

			try {
				await MailingService.sendVerification(body.target, code, verif);
			} catch (e) {
				Logger.error(e, 'Error sending verification email.');
				throw new AppError('auth/verification-email-error');
			}

			return {
				verification: verif,
			};
		}

		throw new AppError('auth/invalid-verification-type');
	},
	{
		body: t.Object({
			type: verificationTypeSchema,
			scenario: verificationScenarioSchema,
			target: t.String(),
		}),
		response: {
			200: t.Object({
				verification: verificationDigestSchema,
			}),
			...createErrorResps(400, 503),
		},
		detail: {
			summary: 'Request Verification',
			description: 'Request sending verification codes to the user.',
			tags: ['Authentication'],
		},
	},
);
