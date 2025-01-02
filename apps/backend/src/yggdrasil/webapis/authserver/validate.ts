import { yggTokenSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { Static, t } from 'elysia';
import { SessionScope, SessionService } from '~backend/services/auth/session';

export const validateBodySchema = yggTokenSchema;
export const validateResponseSchema = t.Void();
export const validateDataSchema = t.Boolean();

export async function validate(
	body: Static<typeof validateBodySchema>,
): Promise<Static<typeof validateDataSchema>> {
	const session = (await SessionService.validate(body.accessToken))?.session;
	return !(
		session &&
		session.scope === SessionScope.YGGDRASIL &&
		// When client token is provided, check if it matches, otherwise ignore it.
		(!body.clientToken || body.clientToken === session.metadata.clientToken)
	);
}
