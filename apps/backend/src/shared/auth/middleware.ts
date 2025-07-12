import { Elysia } from 'elysia';
import { SessionScope, SessionLifecycle } from '#modules/auth/auth.entities';
import { SessionValidationService } from '#modules/auth/services/session.service';
import { readBearerToken } from '#shared/auth/utils';
import { AppError } from '#shared/middlewares/errors/app-error';

type AuthMiddlewareOptions = {
	allowedLifecycle: Exclude<SessionLifecycle, (typeof SessionLifecycle)['Expired']>[];
};

const defaultOptions: AuthMiddlewareOptions = {
	allowedLifecycle: [SessionLifecycle.Active],
};

export const authMiddleware =
	<TScope extends SessionScope>(scope: TScope, optOverrides?: Partial<AuthMiddlewareOptions>) =>
	(app: Elysia) =>
		app.derive(async ({ headers }) => {
			const options = {
				...defaultOptions,
				...optOverrides,
			};

			const authz = headers['authorization'];
			const bearer = authz ? readBearerToken(authz) : null;
			if (!bearer) throw new AppError('unauthorized');

			const [sessionId, token] = bearer.split(':');
			if (!sessionId || !token) throw new AppError('unauthorized');

			const sessionInfo = await SessionValidationService.validate(
				sessionId,
				token,
				scope,
				options.allowedLifecycle,
			);

			return sessionInfo.caseOf({
				Left: () => {
					throw new AppError('unauthorized');
				},
				Right: (session) => session,
			});
		});
