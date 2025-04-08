import { Elysia } from 'elysia';
import { changePasswordHandler } from './webapis/change-password';
import { listSessionsHandler } from './webapis/list-sessions';
import { refreshHandler } from './webapis/refresh';
import { resetPasswordHandler } from './webapis/reset-password';
import { revokeAllSessionsHandler } from './webapis/revoke-all-sessions';
import { revokeSessionHandler } from './webapis/revoke-session';
import { signinHandler } from './webapis/signin';
import { signupHandler } from './webapis/signup';
import { validateHandler } from './webapis/validate';
import { inspectVerificationHandler } from './webapis/verification/inspect-verification';
import { requestVerificationHandler } from './webapis/verification/request-verification';
import { verifyVerificationHandler } from './webapis/verification/verify-verification';

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
	.use(changePasswordHandler)
	.use(resetPasswordHandler)
	.use(requestVerificationHandler)
	.use(verifyVerificationHandler)
	.use(inspectVerificationHandler);
