import { AuthModel } from './auth.model';
import Elysia, { t } from 'elysia';
import { AuthService } from './auth.service';
import { authMiddleware } from '~/auth/middleware';

export const AuthController = new Elysia({ name: 'Controller.Auth' })
	.use(AuthModel)
	.post('/signup', ({ body }) => AuthService.signup(body), {
		body: 'auth.signup.body',
		response: 'auth.signin.response',
		detail: {
			summary: 'Sign Up',
			description: 'Sign up by username, email and password.',
			tags: ['Authentication'],
		},
	})
	.post('/signin', ({ body }) => AuthService.signin(body), {
		body: 'auth.signin.body',
		response: 'auth.signin.response',
		detail: {
			summary: 'Sign In',
			description: 'Sign in by email and password.',
			tags: ['Authentication'],
		},
	})
	.use(authMiddleware)
	.post('/session/refresh', ({ session }) => AuthService.refresh(session), {
		response: 'auth.signin.response',
		detail: {
			summary: 'Refresh Session',
			description: 'Invalidate the current session and create a new one.',
			tags: ['Authentication'],
			security: [{ sessionId: [] }],
		},
	})
	.get('/session', () => {}, {
		detail: {
			summary: 'Get All Sessions',
			description: 'Get all sessions of the current user.',
			tags: ['Authentication'],
			security: [{ sessionId: [] }],
		},
	})
	.get('/session/:uid', () => {}, {
		detail: {
			summary: 'Get Session',
			description: 'Get session info of the current user by session UID.',
			tags: ['Authentication'],
			security: [{ sessionId: [] }],
		},
	})
	.delete('/session', () => {}, {
		detail: {
			summary: 'Revoke All Sessions',
			description: 'Invalidate all sessions for the current user.',
			tags: ['Authentication'],
			security: [{ sessionId: [] }],
		},
	})
	.delete('/session/:uid', () => {}, {
		detail: {
			summary: 'Revoke Session',
			description: 'Invalidate a specific session of the current user.',
			tags: ['Authentication'],
			security: [{ sessionId: [] }],
		},
	});
