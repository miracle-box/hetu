import { Elysia } from 'elysia';
import { SessionLifecycle, SessionScope } from '~backend/auth/auth.entities';
import { SessionService } from '~backend/services/auth/session';
import { hasProperty } from '~backend/shared/typing/utils';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';
import { ForbiddenOperationException } from './utils/errors';

type AuthMiddlewareOptions = {
	allowedLifecycle: Exclude<SessionLifecycle, (typeof SessionLifecycle)['Expired']>[];
};

const defaultOptions: AuthMiddlewareOptions = {
	allowedLifecycle: [SessionLifecycle.Active, SessionLifecycle.Renewable],
};

export const validateTokenMiddleware =
	(validateClientToken: boolean, optsOverride?: AuthMiddlewareOptions) => (app: Elysia) =>
		app.derive(async ({ body }) => {
			const opts = {
				...defaultOptions,
				...optsOverride,
			};

			// Make sure accessToken is in the body.
			if (!hasProperty(body, 'accessToken') || typeof body.accessToken !== 'string')
				throw new ForbiddenOperationException('Invalid token.');

			const accessToken = YggdrasilService.parseAccessToken(body.accessToken);
			if (!accessToken) throw new ForbiddenOperationException('Invalid token.');

			const info = await SessionService.validate(
				accessToken.sessionId,
				accessToken.sessionToken,
				SessionScope.YGGDRASIL,
				opts.allowedLifecycle,
			);
			if (!info || info.session.metadata.scope !== SessionScope.YGGDRASIL)
				throw new ForbiddenOperationException('Invalid token.');

			if (validateClientToken) {
				// Invalid clientToken
				if (
					hasProperty(body, 'clientToken') &&
					body.clientToken !== info.session.metadata.clientToken
				) {
					throw new ForbiddenOperationException('Invalid token.');
				}
			}

			return info;
		});
