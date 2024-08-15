import Elysia, { t } from 'elysia';
import { AuthService } from './auth.service';
import { AuthModel } from './auth.model';
import { authMiddleware } from '~/auth/middleware';

export const AuthController = new Elysia({
	name: 'Controller.Auth',
	prefix: '/auth',
})
	.use(AuthModel)
	.post(
		'/signup',
		async ({ body }) => {
			return { session: await AuthService.signup(body) };
		},
		{
			body: 'auth.signup.body',
			response: 'auth.signup.response',
			detail: {
				summary: 'Sign Up',
				description: 'Sign up by username, email and password.',
				tags: ['Authentication'],
			},
		},
	)
	.post(
		'/signin',
		async ({ body }) => {
			return { session: await AuthService.signin(body) };
		},
		{
			body: 'auth.signin.body',
			response: 'auth.signin.response',
			detail: {
				summary: 'Sign In',
				description: 'Sign in by email and password.',
				tags: ['Authentication'],
			},
		},
	)
	// [TODO] TEMPORARY.
	.post(
		'/reset-password',
		async ({ body, set }) => {
			const verification = await AuthService.createResetPasswordVerification(body.email);
			set.status = 'Accepted';
			return verification;
		},
		{
			body: 'auth.reset-password-init.body',
			response: {
				202: 'auth.reset-password-init.response',
			},
			detail: {
				summary: 'Initialize Password Reset',
				description: 'Initialize the process of password reset.',
				tags: ['Authentication'],
			},
		},
	)
	.post(
		'/reset-password/:id',
		async ({ body, params, set }) => {
			await AuthService.resetPassword(params.id, body.verificationSecret, body.password);
			set.status = 'No Content';
		},
		{
			body: 'auth.reset-password.body',
			response: {
				204: t.Void(),
			},
			detail: {
				summary: 'Reset Password',
				description: 'Reset the password by providing the verification info.',
				tags: ['Authentication'],
			},
		},
	)

	.use(authMiddleware('default'))
	.post(
		'/sessions/refresh',
		async ({ session }) => {
			return { session: await AuthService.refresh(session) };
		},
		{
			response: 'auth.sessions.refresh.response',
			detail: {
				summary: 'Refresh Session',
				description: 'Invalidate the current session and create a new one.',
				tags: ['Authentication'],
				security: [{ sessionId: [] }],
			},
		},
	)
	.get('/sessions', ({ user }) => AuthService.getUserSessionSummaries(user.id), {
		response: 'auth.sessions.summary-all.response',
		detail: {
			summary: 'Get All Sessions',
			description: 'Get summary all sessions of the current user.',
			tags: ['Authentication'],
			security: [{ sessionId: [] }],
		},
	})
	.get(
		'/sessions/:uid',
		async ({ params, user, set }) => {
			const targetSession = await AuthService.getSessionSummary(user.id, params.uid);
			// [TODO] Handle errors in one place.
			if (!targetSession) {
				set.status = 'Not Found';
				throw new Error('Session not found.');
			}

			return targetSession;
		},
		{
			response: 'auth.sessions.summary.response',
			detail: {
				summary: 'Get Session',
				description: 'Get session summary of the current user by session UID.',
				tags: ['Authentication'],
				security: [{ sessionId: [] }],
			},
		},
	)
	.delete(
		'/sessions',
		({ user, set }) => {
			set.status = 'No Content';
			AuthService.revokeUserSessions(user.id);
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
		({ params, user, set }) => {
			set.status = 'No Content';
			AuthService.revokeSession(user.id, params.uid);
		},
		{
			response: {
				204: t.Void(),
			},
			detail: {
				summary: 'Revoke Session',
				description: 'Invalidate a specific session of the current user.',
				tags: ['Authentication'],
				security: [{ sessionId: [] }],
			},
		},
	)
	// [TODO] TEMPORARY.
	.post(
		'/change-password',
		async ({ user, body }) => {
			return {
				session: await AuthService.changePassword(
					user.id,
					body.oldPassword,
					body.newPassword,
				),
			};
		},
		{
			body: 'auth.change-password.body',
			response: 'auth.change-password.response',
			detail: {
				summary: 'Change Password',
				description: 'Change password of the current user.',
				tags: ['Authentication'],
				security: [{ sessionId: [] }],
			},
		},
	);
