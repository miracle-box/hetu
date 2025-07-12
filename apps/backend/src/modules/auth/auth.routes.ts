import { Elysia } from 'elysia';
import { checkOauth2BindingHandler } from '#modules/auth/webapis/oauth2/check-oauth2-binding.handler';
import { confirmOauth2BindingHandler } from '#modules/auth/webapis/oauth2/confirm-oauth2-binding.handler';
import { getOauth2MetadataHandler } from '#modules/auth/webapis/oauth2/get-oauth2-metadata.handler';
import { oauth2SigninHandler } from '#modules/auth/webapis/oauth2/oauth2-signin.handler';
import { changePasswordHandler } from '#modules/auth/webapis/password/change-password.handler';
import { resetPasswordHandler } from '#modules/auth/webapis/password/reset-password.handler';
import { listSessionsHandler } from '#modules/auth/webapis/sessions/list-sessions.handler';
import { refreshSessionHandler } from '#modules/auth/webapis/sessions/refresh-session.handler';
import { revokeAllSessionsHandler } from '#modules/auth/webapis/sessions/revoke-all-sessions.handler';
import { revokeSessionHandler } from '#modules/auth/webapis/sessions/revoke-session.handler';
import { validateSessionHandler } from '#modules/auth/webapis/sessions/validate-session.handler';
import { signinHandler } from '#modules/auth/webapis/signin';
import { signupHandler } from '#modules/auth/webapis/signup';
import { inspectVerificationHandler } from '#modules/auth/webapis/verifications/inspect-verification.handler';
import { requestVerificationHandler } from '#modules/auth/webapis/verifications/request-verification.handler';
import { verifyVerificationHandler } from '#modules/auth/webapis/verifications/verify-verification.handler';

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
