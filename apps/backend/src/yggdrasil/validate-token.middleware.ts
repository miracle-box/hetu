import { Elysia } from 'elysia';
import { SessionService } from '~backend/services/auth/session';
import { SessionScope } from '~backend/auth/auth.entities';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';
import { hasProperty } from '~backend/shared/typing/utils';
import { ForbiddenOperationException } from './utils/errors';

export const validateTokenMiddleware = (validateClientToken: boolean) => (app: Elysia) =>
	app.derive(async ({ body }) => {
		// Make sure accessToken is in the body.
		if (!hasProperty(body, 'accessToken') || typeof body.accessToken !== 'string')
			throw new ForbiddenOperationException('Invalid token.');

		const accessToken = YggdrasilService.parseAccessToken(body.accessToken);
		if (!accessToken) throw new ForbiddenOperationException('Invalid token.');

		const info = await SessionService.validate(
			accessToken.sessionId,
			accessToken.sessionToken,
			SessionScope.YGGDRASIL,
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
