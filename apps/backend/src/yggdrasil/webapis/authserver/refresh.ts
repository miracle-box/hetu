import { Elysia, t } from 'elysia';
import {
	yggProfileDigestSchema,
	yggTokenSchema,
	yggUserSchema,
} from '~backend/yggdrasil/yggdrasil.entities';
import { SessionService } from '~backend/services/auth/session';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';
import { SessionScope } from '~backend/auth/auth.entities';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';
import {
	ForbiddenOperationException,
	IllegalArgumentException,
} from '~backend/yggdrasil/utils/errors';
import { validateTokenMiddleware } from '~backend/yggdrasil/validate-token.middleware';

export const refreshHandler = new Elysia().use(validateTokenMiddleware(true)).post(
	'/refresh',
	async ({ body, session }) => {
		// Use profile form request body if provided, otherwise use the one from the session.
		const sessionProfileId = session.metadata.selectedProfile;

		// Must NOT have a profile selected when selecting profiles.
		if (sessionProfileId !== null && body.selectedProfile?.id === sessionProfileId)
			throw new ForbiddenOperationException('Access token already has a profile assigned.');

		const profile = body.selectedProfile
			? await YggdrasilRepository.getProfileDigestById(body.selectedProfile.id)
			: sessionProfileId
				? await YggdrasilRepository.getProfileDigestById(sessionProfileId)
				: null;

		// Profile must be selected
		if (!profile)
			throw new IllegalArgumentException('Profile must be selected when refreshing a token!');
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
	},
	{
		body: t.Composite([
			yggTokenSchema,
			t.Object({
				requestUser: t.Boolean({ default: false }),
				selectedProfile: t.Optional(yggProfileDigestSchema),
			}),
		]),
		response: {
			200: t.Composite([
				yggTokenSchema,
				t.Object({
					selectedProfile: t.Optional(yggProfileDigestSchema),
					user: t.Optional(yggUserSchema),
				}),
			]),
		},
		detail: {
			summary: 'Resfesh Token',
			description: 'Get a new token and invalidate the old one.',
			tags: ['Yggdrasil'],
		},
	},
);
