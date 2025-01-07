import { Elysia } from 'elysia';
import { SessionService } from '~backend/services/auth/session';
import { SessionScope } from '~backend/auth/auth.entities';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';
import { hasProperty } from '~backend/shared/typing/utils';

export const validateTokenMiddleware = (validateClientToken: boolean) => (app: Elysia) =>
	app.derive(async ({ body }) => {
		// Make sure accessToken is in the body.
		if (!hasProperty(body, 'accessToken') || typeof body.accessToken !== 'string')
			throw new Error('Unauthorized');

		const accessToken = YggdrasilService.parseAccessToken(body.accessToken);
		if (!accessToken) throw new Error('Unauthorized');

		const info = await SessionService.validate(
			accessToken.sessionId,
			accessToken.sessionToken,
			SessionScope.YGGDRASIL,
		);
		if (!info || info.session.metadata.scope !== SessionScope.YGGDRASIL)
			throw new Error('Unauthorized');

		if (validateClientToken) {
			// Invalid clientToken
			if (
				hasProperty(body, 'clientToken') &&
				body.clientToken !== info.session.metadata.clientToken
			) {
				throw new Error('Unauthorized');
			}
		}

		return info;
	});
