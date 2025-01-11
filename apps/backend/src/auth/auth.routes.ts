import { Elysia, t } from 'elysia';
import { SessionScope } from '~backend/auth/auth.entities';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { signup, signupBodySchema, signupResponseSchema } from './webapis/signup';
import { signin, signinBodySchema, signinResponseSchema } from './webapis/signin';
import { refresh, refreshResponseSchema } from './webapis/refresh';
import { listSessions, listSessionsResponseSchema } from './webapis/list-sessions';
import {
	revokeSession,
	revokeSessionParamsSchema,
	revokeSessionResponseSchema,
} from './webapis/revoke-session';
import { revokeAllSessions } from './webapis/revoke-all-sessions';
import {
	changePassword,
	changePasswordBodySchema,
	changePasswordResponseSchema,
} from './webapis/change-password';
import { validate, validateResponseSchema } from '~backend/auth/webapis/validate';

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
	.post('/validate', async ({ session }) => await validate(session), {
		response: {
			200: validateResponseSchema,
		},
		detail: {
			summary: 'Validate Session',
			description:
				'Validate the current session, will renew if the session is about to expire.',
			tags: ['Authentication'],
			security: [{ session: [] }],
		},
	})
	.post('/sessions/refresh', async ({ session }) => await refresh(session), {
		response: {
			200: refreshResponseSchema,
		},
		detail: {
			summary: 'Refresh Session',
			description: 'Invalidate the current session and create a new one.',
			tags: ['Authentication'],
			security: [{ session: [] }],
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
			security: [{ session: [] }],
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
				security: [{ session: [] }],
			},
		},
	)
	.delete(
		'/sessions/:id',
		async ({ params, user, set }) => {
			set.status = 'No Content';
			await revokeSession(params, user.id);
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
				security: [{ session: [] }],
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
			security: [{ session: [] }],
		},
	});
