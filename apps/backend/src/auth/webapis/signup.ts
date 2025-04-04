import type { Session } from '~backend/auth/auth.entities';
import { Elysia, t } from 'elysia';
import {
	sessionSchema,
	SessionScope,
	VerificationScenario,
	VerificationType,
} from '~backend/auth/auth.entities';
import { PasswordService } from '~backend/services/auth/password';
import { SessionService } from '~backend/services/auth/session';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';
import { UsersRepository } from '~backend/users/users.repository';
import { AuthRepository } from '../auth.repository';

export const signupHandler = new Elysia().post(
	'/signup',
	async ({ body }) => {
		const passwordHash = await PasswordService.hash(body.password);

		if (await UsersRepository.emailOrNameExists(body.email, body.name))
			throw new AppError('auth/user-exists');

		// [TODO] Probably these checks (and the revocation process) should be placed in a separate usecase
		const verif = await AuthRepository.findVerifiedVerification(
			body.verificationId,
			VerificationType.EMAIL,
			VerificationScenario.SIGNUP,
		);
		if (!verif) throw new AppError('auth/invalid-signup-verification');
		// Revoke the verification after redeem.
		await AuthRepository.revokeVerificationById(body.verificationId);

		const user = await UsersRepository.createWithPassword({
			name: body.name,
			email: body.email,
			passwordHash,
		});

		const session = (await SessionService.create(user.id, {
			scope: SessionScope.DEFAULT,
		})) as Session<typeof SessionScope.DEFAULT>;

		return { session };
	},
	{
		body: t.Object({
			name: t.String({
				minLength: 3,
				maxLength: 16,
			}),
			verificationId: t.String(),
			email: t.String({ format: 'email' }),
			password: t.String({
				minLength: 8,
				maxLength: 120,
			}),
		}),
		response: {
			200: t.Object({
				session: sessionSchema(t.Literal(SessionScope.DEFAULT)),
			}),
			...createErrorResps(409),
		},
		detail: {
			summary: 'Sign Up',
			description: 'Sign up by username, email and password.',
			tags: ['Authentication'],
		},
	},
);
