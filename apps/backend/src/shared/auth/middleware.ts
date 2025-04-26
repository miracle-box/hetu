import type { User } from '~backend/users/user.entities';
import { Elysia } from 'elysia';
import { SessionLifecycle, type Session } from '~backend/auth/auth.entities';
import { SessionScope } from '~backend/auth/auth.entities';
import { SessionService } from '~backend/services/auth/session';
import { readBearerToken } from '~backend/shared/auth/utils';
import { AppError } from '../middlewares/errors/app-error';

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

			const sessionInfo = (await SessionService.validate(
				sessionId,
				token,
				scope,
				options.allowedLifecycle,
			)) satisfies {
				// Workaround for TS4023, the type guard will still work here.
				user: User;
				session: Session<TScope>;
			} | null as {
				user: User;
				session: Session<TScope>;
			} | null;

			if (!sessionInfo) throw new AppError('unauthorized');

			return sessionInfo;
		});
