import { Elysia, t } from 'elysia';
import { AuthRepository } from '~backend/auth/auth.repository';
import { PasswordService } from '~backend/services/auth/password';
import { SessionService } from '~backend/services/auth/session';
import { Session, sessionSchema, SessionScope } from '~backend/auth/auth.entities';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const changePasswordHandler = new Elysia().use(authMiddleware(SessionScope.DEFAULT)).post(
	'/change-password',
	async ({ user, body }) => {
		const oldPasswordHash = await AuthRepository.getPassword(user.id);

		// If the user does not have a password, we set a password here.
		const oldPasswordCorrect = oldPasswordHash
			? await PasswordService.compare(body.oldPassword, oldPasswordHash)
			: true;
		if (!oldPasswordCorrect) {
			throw new AppError('auth/invalid-credentials');
		}

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
			oldPassword: t.String(),
			newPassword: t.String({
				minLength: 8,
				maxLength: 120,
			}),
		}),
		response: {
			200: t.Object({
				session: sessionSchema(t.Literal(SessionScope.DEFAULT)),
			}),
			...createErrorResps(400),
		},
		detail: {
			summary: 'Change Password',
			description: 'Change password of the current user.',
			tags: ['Authentication'],
			security: [{ session: [] }],
		},
	},
);
