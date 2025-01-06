import { Static, t } from 'elysia';
import {
	yggProfileDigestSchema,
	yggTokenSchema,
	yggUserSchema,
} from '~backend/yggdrasil/yggdrasil.entities';
import { SessionService } from '~backend/services/auth/session';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';
import { SessionScope } from '~backend/auth/auth.entities';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';

export const refreshBodySchema = t.Composite([
	yggTokenSchema,
	t.Object({
		requestUser: t.Boolean({ default: false }),
		selectedProfile: t.Optional(yggProfileDigestSchema),
	}),
]);
export const refreshResponseSchema = t.Composite([
	yggTokenSchema,
	t.Object({
		selectedProfile: t.Optional(yggProfileDigestSchema),
		user: t.Optional(yggUserSchema),
	}),
]);

export async function refresh(
	body: Static<typeof refreshBodySchema>,
): Promise<Static<typeof refreshResponseSchema>> {
	// [TODO] Error handling in Mojang's format

	const accessToken = YggdrasilService.parseAccessToken(body.accessToken);
	if (!accessToken) throw new Error('Invalid session!');

	const session = (await SessionService.validate(accessToken.sessionId, accessToken.sessionToken))
		?.session;
	if (
		!session ||
		session.metadata.scope !== SessionScope.YGGDRASIL ||
		// When client token is provided, check if it matches, otherwise ignore it.
		(body.clientToken && body.clientToken !== session.metadata.clientToken)
	) {
		throw new Error('Invalid session!');
	}

	// Use profile form request body if provided, otherwise use the one from the session.
	const sessionSelectedProfileId = session.metadata.selectedProfile;
	const selectedProfile = body.selectedProfile
		? await YggdrasilRepository.getProfileDigestById(body.selectedProfile.id)
		: sessionSelectedProfileId
			? await YggdrasilRepository.getProfileDigestById(sessionSelectedProfileId)
			: null;

	// Profile must be selected
	if (!selectedProfile) throw new Error('You should select a profile when refreshing a session!');

	const clientToken = YggdrasilService.generateClientToken(body.clientToken);

	await SessionService.revoke(session.id);
	const newSession = await SessionService.create(session.userId, {
		scope: SessionScope.YGGDRASIL,
		clientToken,
		selectedProfile: selectedProfile.id,
	});

	return {
		accessToken: YggdrasilService.createAccessToken(newSession),
		clientToken: clientToken,
		// [TODO] Probably move this to a separate method.
		user: body.requestUser ? { id: session.userId, properties: [] } : undefined,
		selectedProfile: YggdrasilService.getYggdrasilProfileDigest(selectedProfile),
	};
}
