import { Elysia, t } from 'elysia';
import { UsersRepository } from '~backend/users/users.repository';
import { PasswordService } from '~backend/services/auth/password';
import { SessionService } from '~backend/services/auth/session';
import { Session, sessionSchema, SessionScope } from '~backend/auth/auth.entities';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const signupHandler = new Elysia().post(
	'/signup',
	async ({ body }) => {
		const passwordHash = await PasswordService.hash(body.password);

		if (await UsersRepository.emailOrNameExists(body.email, body.name))
			throw new AppError('auth/user-exists');
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
