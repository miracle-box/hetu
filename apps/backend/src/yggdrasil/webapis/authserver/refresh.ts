import { Static, t } from 'elysia';
import {
	yggProfileDigestSchema,
	yggTokenSchema,
	yggUserSchema,
} from '~backend/yggdrasil/yggdrasil.entities';
import { SessionService } from '~backend/services/auth/session';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';
import { Session, SessionScope } from '~backend/auth/auth.entities';
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
	session: Session<typeof SessionScope.YGGDRASIL>,
): Promise<Static<typeof refreshResponseSchema>> {
	// [TODO] Error handling in Mojang's format

	// Use profile form request body if provided, otherwise use the one from the session.
	const sessionProfileId = session.metadata.selectedProfile;
	const profile = body.selectedProfile
		? await YggdrasilRepository.getProfileDigestById(body.selectedProfile.id)
		: sessionProfileId
			? await YggdrasilRepository.getProfileDigestById(sessionProfileId)
			: null;

	// Profile must be selected
	if (!profile) throw new Error('You should select a profile when refreshing a session!');
	const yggSelectedProfile = YggdrasilService.getYggdrasilProfileDigest(profile);

	const clientToken = YggdrasilService.generateClientToken(body.clientToken);

	await SessionService.revoke(session.id);
	const newSession = await SessionService.create(session.userId, {
		scope: SessionScope.YGGDRASIL,
		clientToken,
		selectedProfile: yggSelectedProfile.id,
	});

	return {
		accessToken: YggdrasilService.createAccessToken(newSession),
		clientToken: clientToken,
		// [TODO] Probably move this to a separate method.
		user: body.requestUser ? { id: session.userId, properties: [] } : undefined,
		selectedProfile: yggSelectedProfile,
	};
}
