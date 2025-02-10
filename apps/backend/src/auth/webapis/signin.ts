import { Elysia, t } from 'elysia';
import { UsersRepository } from '~backend/users/users.repository';
import { SessionService } from '~backend/services/auth/session';
import { PasswordService } from '~backend/services/auth/password';
import { Session, sessionSchema, SessionScope } from '~backend/auth/auth.entities';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const signinHandler = new Elysia().post(
	'/signin',
	async ({ body }) => {
		const user = await UsersRepository.findUserWithPassword(body.email);

		// [TODO] Consider add login limit to prevent possible attacks.
		if (!user) {
			throw new AppError('auth/invalid-credentials');
		}

		const passwordCorrect = await PasswordService.compare(body.password, user.passwordHash);
		if (!passwordCorrect) {
			throw new AppError('auth/invalid-credentials');
		}

		const session = (await SessionService.create(user.id, {
			scope: SessionScope.DEFAULT,
		})) as Session<typeof SessionScope.DEFAULT>;

		return { session };
	},
	{
		body: t.Object({
			email: t.String(),
			password: t.String(),
		}),
		response: {
			200: t.Object({
				session: sessionSchema(t.Literal(SessionScope.DEFAULT)),
			}),
			...createErrorResps(400),
		},
		detail: {
			summary: 'Sign In',
			description: 'Sign in by email and password.',
			tags: ['Authentication'],
		},
	},
);
