import type { Session } from '~backend/auth/auth.entities';
import { Elysia, t } from 'elysia';
import { sessionSchema, SessionScope, VerificationScenario } from '~backend/auth/auth.entities';
import { AuthRepository } from '~backend/auth/auth.repository';
import { PasswordService } from '~backend/services/auth/password';
import { SessionService } from '~backend/services/auth/session';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';
import { UsersRepository } from '~backend/users/users.repository';

export const resetPasswordHandler = new Elysia().post(
	'/reset-password',
	async ({ body }) => {
		// [TODO] Probably these checks (and the revocation process) should be placed in a separate usecase
		const verif = await AuthRepository.findVerifiedVerification(
			body.verificationId,
			VerificationScenario.PASSWORD_RESET,
		);
		if (!verif || !verif.userId) throw new AppError('auth/invalid-verification');
		await AuthRepository.revokeVerificationById(body.verificationId);

		const user = await UsersRepository.findById(verif.userId);
		if (!user) throw new AppError('users/not-found');

		const hashedNewPassword = await PasswordService.hash(body.newPassword);
		await AuthRepository.upsertPassword({ userId: user.id, passwordHash: hashedNewPassword });

		await SessionService.revokeAll(user.id);
		const session = (await SessionService.create(user.id, {
			scope: SessionScope.DEFAULT,
		})) as Session<typeof SessionScope.DEFAULT>;

		return { session };
	},
	{
		body: t.Object({
			verificationId: t.String(),
			newPassword: t.String({
				minLength: 8,
				maxLength: 120,
			}),
		}),
		response: {
			200: t.Object({
				session: sessionSchema(t.Literal(SessionScope.DEFAULT)),
			}),
			...createErrorResps(400, 404),
		},
		detail: {
			summary: 'Reset Password',
			description: 'Reset password after verifying your identity.',
			tags: ['Authentication'],
		},
	},
);
