import { Static, t } from 'elysia';
import {
	yggProfileSchema,
	yggTokenSchema,
	yggUserSchema,
} from '~backend/yggdrasil/yggdrasil.entities';
import { SessionScope, SessionService } from '~backend/services/auth/session';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';

export const refreshBodySchema = t.Composite([
	yggTokenSchema,
	t.Object({
		requestUser: t.Boolean({ default: false }),
		selectedProfile: t.Optional(yggProfileSchema),
	}),
]);
export const refreshResponseSchema = t.Composite([
	yggTokenSchema,
	t.Object({
		selectedProfile: t.Optional(yggProfileSchema),
		user: t.Optional(yggUserSchema),
	}),
]);

export async function refresh(
	body: Static<typeof refreshBodySchema>,
): Promise<Static<typeof refreshResponseSchema>> {
	// [TODO] Error handling in Mojang's format

	const session = (await SessionService.validate(body.accessToken))?.session;
	if (
		!session ||
		session.scope !== SessionScope.YGGDRASIL ||
		// When client token is provided, check if it matches, otherwise ignore it.
		(body.clientToken && body.clientToken !== session.metadata.clientToken)
	) {
		throw new Error('Invalid session!');
	}

	const clientToken = YggdrasilService.generateClientToken(body.clientToken);

	await SessionService.invalidate(session.id);
	const newSession = await SessionService.create(session.userId, {
		scope: SessionScope.YGGDRASIL,
		metadata: {
			clientToken,
		},
	});

	return {
		accessToken: newSession.id,
		clientToken: clientToken,
		// [TODO] Probably move this to a separate method.
		user: body.requestUser ? { id: session.userId, properties: [] } : undefined,
		selectedProfile: body.selectedProfile,
	};
}
