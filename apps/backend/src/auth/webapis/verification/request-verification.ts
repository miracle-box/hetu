import { randomInt, randomBytes, createHash } from 'node:crypto';
import { Elysia, t } from 'elysia';
import {
	verificationDigestSchema,
	VerificationScenario,
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
import { UsersRepository } from '~backend/users/users.repository';
import { Config } from '~backend/shared/config';

export const requestVerificationHandler = new Elysia().post(
	'/verification/request',
	async ({ body }) => {
		if (body.type === VerificationType.EMAIL) {
			if (
				body.scenario !== VerificationScenario.SIGNUP &&
				body.scenario !== VerificationScenario.PASSWORD_RESET
			) {
				// [TODO] Add acceptable scenarios in error response
				throw new AppError('auth/invalid-verification-scenario');
			}

			const user = await UsersRepository.findByEmail(body.target);
			// [TODO] Make each TYPE and SCENARIO a separate usecase or something, to separate these checks.
			// Check if the email is already signed up in [signup] scenario
			if (body.scenario === VerificationScenario.SIGNUP && user) {
				throw new AppError('auth/user-exists');
			}

			const code = randomInt(0, 10 ** 8)
				.toString()
				.padStart(8, '0');
			const codeHash = await PasswordService.hash(code);

			const verif = await AuthRepository.createOnlyVerification({
				userId: user?.id,
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

			const resp = {
				verification: {
					id: verif.id,
					type: VerificationType.EMAIL,
					scenario: verif.scenario,
					target: verif.target,
					verified: verif.verified,
				},
			};

			// Check if the user exists in [password_reset] scenario
			if (body.scenario === VerificationScenario.PASSWORD_RESET && !user) {
				// DO NOT send the email
				return resp;
			}

			await MailingService.sendVerification(body.target, code, verif).catch((e) => {
				Logger.error(e, 'Error sending verification email.');
				throw new AppError('auth/verification-email-error');
			});

			return resp;
		}

		if (body.type === VerificationType.OAUTH2) {
			if (
				body.scenario !== VerificationScenario.OAUTH2_BIND &&
				body.scenario !== VerificationScenario.OAUTH2_SIGNIN
			) {
				// [TODO] Add acceptable scenarios in error response
				throw new AppError('auth/invalid-verification-scenario');
			}

			const provider = Object.entries(Config.app.oauth.providers).find(
				([key]) => key === body.target,
			)?.[1];

			if (!provider) {
				throw new AppError('auth/invalid-oauth2-provider');
			}

			// Generate PKCE challenge
			const verifier = randomBytes(32).toString('base64url');
			const challenge =
				provider.pkce === 'S256'
					? createHash('sha256').update(verifier).digest('base64url')
					: provider.pkce === 'plain'
						? verifier
						: null;

			const verif = await AuthRepository.createVerification({
				type: body.type,
				scenario: body.scenario,
				// [TODO] Should be configurable (now 10 minutes)
				expiresAt: new Date(Date.now() + 1000 * 60 * 10),
				target: body.target,
				secret: verifier,
				verified: false,
				triesLeft: 1,
			});

			return {
				verification: {
					id: verif.id,
					type: VerificationType.OAUTH2,
					scenario: verif.scenario,
					target: verif.target,
					challenge,
					verified: verif.verified,
				},
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
			...createErrorResps(400, 404, 409, 503),
		},
		detail: {
			summary: 'Request Verification',
			description: 'Request sending verification codes to the user.',
			tags: ['Authentication'],
		},
	},
);
