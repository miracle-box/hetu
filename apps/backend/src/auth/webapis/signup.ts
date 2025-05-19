import type { Session } from '~backend/auth/auth.entities';
import { Elysia, t } from 'elysia';
import { sessionSchema, SessionScope, VerificationScenario } from '~backend/auth/auth.entities';
import { PasswordService } from '~backend/services/auth/password';
import { SessionService } from '~backend/services/auth/session';
import { withTransaction } from '~backend/shared/db';
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
			VerificationScenario.SIGNUP,
		);
		if (!verif) throw new AppError('auth/invalid-verification');
		await AuthRepository.revokeVerificationById(body.verificationId);

		const user = await withTransaction(async ({ transaction }) => {
			const insertedUser = await UsersRepository.insertUser({
				name: body.name,
				email: body.email,
			});

			if (!insertedUser) {
				transaction.rollback();
				return;
			}

			await AuthRepository.upsertPassword({
				userId: insertedUser.id,
				passwordHash,
			});

			return insertedUser;
		});

		// Something failed to insert, it is not an expected condition
		if (!user) throw new Error('Can not create user and password.');

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
			...createErrorResps(400, 409),
		},
		detail: {
			summary: 'Sign Up',
			description: 'Sign up by username, email and password.',
			tags: ['Authentication'],
		},
	},
);
