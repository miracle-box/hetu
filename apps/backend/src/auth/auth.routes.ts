import { Elysia } from 'elysia';
import { changePasswordHandler } from './webapis/change-password';
import { listSessionsHandler } from './webapis/list-sessions';
import { refreshHandler } from './webapis/refresh';
import { revokeAllSessionsHandler } from './webapis/revoke-all-sessions';
import { revokeSessionHandler } from './webapis/revoke-session';
import { signinHandler } from './webapis/signin';
import { signupHandler } from './webapis/signup';
import { validateHandler } from './webapis/validate';

export const AuthRoutes = new Elysia({
	name: 'Routes.Auth',
	prefix: '/auth',
})
	.use(signinHandler)
	.use(signupHandler)
	.use(refreshHandler)
	.use(validateHandler)
	.use(listSessionsHandler)
	.use(revokeSessionHandler)
	.use(revokeAllSessionsHandler)
	.use(changePasswordHandler);
