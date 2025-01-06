import { yggTokenSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { Static, t } from 'elysia';
import { SessionService } from '~backend/services/auth/session';
import { SessionScope } from '~backend/auth/auth.entities';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';

export const validateBodySchema = yggTokenSchema;
export const validateResponseSchema = t.Void();
export const validateDataSchema = t.Boolean();

export async function validate(
	body: Static<typeof validateBodySchema>,
): Promise<Static<typeof validateDataSchema>> {
	const accessToken = YggdrasilService.parseAccessToken(body.accessToken);
	if (!accessToken) throw new Error('Invalid session!');

	const session = (await SessionService.validate(accessToken.sessionId, accessToken.sessionToken))
		?.session;

	// Returns `true` if the token is valid, `false` otherwise.
	return !!(
		session &&
		session.metadata.scope === SessionScope.YGGDRASIL &&
		// When client token is provided, check if it matches, otherwise ignore it.
		(!body.clientToken || body.clientToken === session.metadata.clientToken)
	);
}
