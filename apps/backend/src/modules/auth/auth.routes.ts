import { Elysia } from 'elysia';
import { checkOauth2BindingHandler } from './webapis/oauth2/check-oauth2-binding.handler';
import { confirmOauth2BindingHandler } from './webapis/oauth2/confirm-oauth2-binding.handler';
import { getOauth2MetadataHandler } from './webapis/oauth2/get-oauth2-metadata.handler';
import { oauth2SigninHandler } from './webapis/oauth2/oauth2-signin.handler';
import { changePasswordHandler } from './webapis/password/change-password.handler';
import { resetPasswordHandler } from './webapis/password/reset-password.handler';
import { listSessionsHandler } from './webapis/sessions/list-sessions.handler';
import { refreshSessionHandler } from './webapis/sessions/refresh-session.handler';
import { revokeAllSessionsHandler } from './webapis/sessions/revoke-all-sessions.handler';
import { revokeSessionHandler } from './webapis/sessions/revoke-session.handler';
import { validateSessionHandler } from './webapis/sessions/validate-session.handler';
import { signinHandler } from './webapis/signin';
import { signupHandler } from './webapis/signup';
import { inspectVerificationHandler } from './webapis/verifications/inspect-verification.handler';
import { requestVerificationHandler } from './webapis/verifications/request-verification.handler';
import { verifyVerificationHandler } from './webapis/verifications/verify-verification.handler';

export const AuthRoutes = new Elysia({
	name: 'Routes.Auth',
	prefix: '/auth',
})
	.use(signinHandler)
	.use(signupHandler)
	.use(validateSessionHandler)
	.use(refreshSessionHandler)
	.use(listSessionsHandler)
	.use(revokeSessionHandler)
	.use(revokeAllSessionsHandler)
	.use(changePasswordHandler)
	.use(resetPasswordHandler)
	.use(requestVerificationHandler)
	.use(verifyVerificationHandler)
	.use(inspectVerificationHandler)
	.use(getOauth2MetadataHandler)
	.use(oauth2SigninHandler)
	.use(checkOauth2BindingHandler)
	.use(confirmOauth2BindingHandler);
