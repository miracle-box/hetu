import { Elysia, t } from 'elysia';
import { authMiddleware } from '~/shared/auth/middleware';
import { signup, signupBodySchema, signupResponseSchema } from '~/auth/usecases/signup';
import { signin, signinBodySchema, signinResponseSchema } from '~/auth/usecases/signin';
import { refresh, refreshResponseSchema } from '~/auth/usecases/refresh';
import { listSessions, listSessionsResponseSchema } from '~/auth/usecases/list-sessions';
import {
	revokeSession,
	revokeSessionParamsSchema,
	revokeSessionResponseSchema,
} from '~/auth/usecases/revoke-session';
import { revokeAllSessions } from '~/auth/usecases/revoke-all-sessions';
import { SessionScope } from '~/services/auth/session';
import {
	changePassword,
	changePasswordBodySchema,
	changePasswordResponseSchema,
} from '~/auth/usecases/change-password';

export const AuthRoutes = new Elysia({
	name: 'Routes.Auth',
	prefix: '/auth',
})
	.post('/signup', async ({ body }) => await signup(body), {
		body: signupBodySchema,
		response: {
			200: signupResponseSchema,
		},
		detail: {
			summary: 'Sign Up',
			description: 'Sign up by username, email and password.',
			tags: ['Authentication'],
		},
	})
	.post('/signin', async ({ body }) => await signin(body), {
		body: signinBodySchema,
		response: {
			200: signinResponseSchema,
		},
		detail: {
			summary: 'Sign In',
			description: 'Sign in by email and password.',
			tags: ['Authentication'],
		},
	})
	.use(authMiddleware(SessionScope.DEFAULT))
	.post('/sessions/refresh', async ({ session }) => await refresh(session), {
		response: {
			200: refreshResponseSchema,
		},
		detail: {
			summary: 'Refresh Session',
			description: 'Invalidate the current session and create a new one.',
			tags: ['Authentication'],
			security: [{ sessionId: [] }],
		},
	})
	.get('/sessions', async ({ user }) => await listSessions(user.id), {
		response: {
			200: listSessionsResponseSchema,
		},
		detail: {
			summary: 'List Sessions',
			description: 'Get digest of all sessions of the current user.',
			tags: ['Authentication'],
			security: [{ sessionId: [] }],
		},
	})
	.delete(
		'/sessions',
		async ({ user, set }) => {
			set.status = 'No Content';
			await revokeAllSessions(user.id);
		},
		{
			response: {
				204: t.Void(),
			},
			detail: {
				summary: 'Revoke All Sessions',
				description: 'Invalidate all sessions for the current user.',
				tags: ['Authentication'],
				security: [{ sessionId: [] }],
			},
		},
	)
	.delete(
		'/sessions/:uid',
		async ({ params, user, set }) => {
			set.status = 'No Content';
			await revokeSession(user.id, params.uid);
		},
		{
			params: revokeSessionParamsSchema,
			response: {
				204: revokeSessionResponseSchema,
			},
			detail: {
				summary: 'Revoke Session',
				description: 'Invalidate a specific session of the current user.',
				tags: ['Authentication'],
				security: [{ sessionId: [] }],
			},
		},
	)
	.post('/change-password', async ({ user, body }) => await changePassword(body, user.id), {
		body: changePasswordBodySchema,
		response: {
			200: changePasswordResponseSchema,
		},
		detail: {
			summary: 'Change Password',
			description: 'Change password of the current user.',
			tags: ['Authentication'],
			security: [{ sessionId: [] }],
		},
	});
