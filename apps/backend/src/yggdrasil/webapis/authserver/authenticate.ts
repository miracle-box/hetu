import { Static, t } from 'elysia';
import {
	yggCredentialsSchema,
	yggProfileDigestSchema,
	yggTokenSchema,
	yggUserSchema,
} from '~backend/yggdrasil/yggdrasil.entities';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';
import { UsersRepository } from '~backend/users/users.repository';
import { PasswordService } from '~backend/services/auth/password';
import { SessionService } from '~backend/services/auth/session';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';
import { SessionScope } from '~backend/auth/auth.entities';

export const authenticateBodySchema = t.Composite([
	yggCredentialsSchema,
	t.Object({
		clientToken: t.Optional(t.String()),
		requestUser: t.Optional(t.Boolean({ default: false })),
		agent: t.Object({
			name: t.String(),
			version: t.Number(),
		}),
	}),
]);
export const authenticateResponseSchema = t.Composite([
	yggTokenSchema,
	t.Object({
		availableProfiles: t.Array(yggProfileDigestSchema),
		selectedProfile: t.Optional(yggProfileDigestSchema),
		user: t.Optional(yggUserSchema),
	}),
]);

export async function authenticate(
	body: Static<typeof authenticateBodySchema>,
): Promise<Static<typeof authenticateResponseSchema>> {
	// [TODO] Error handling in Mojang's format

	const user = await UsersRepository.findUserWithPassword(body.username);
	// [TODO] Consider add login limit to prevent possible attacks.
	if (!user) {
		throw new Error('Invalid credentials.');
	}

	const passwordCorrect = PasswordService.compare(body.password, user.passwordHash);
	if (!passwordCorrect) {
		throw new Error('Invalid credentials.');
	}

	const clientToken = YggdrasilService.generateClientToken(body.clientToken);
	const yggProfiles = (await YggdrasilRepository.getProfilesDigestByUser(user.id)).map(
		(profile) => YggdrasilService.getYggdrasilProfileDigest(profile),
	);

	// Select the only profile if there's only one.
	const selectedProfile = yggProfiles.length === 1 ? yggProfiles[0] : null;

	const session = await SessionService.create(user.id, {
		scope: SessionScope.YGGDRASIL,
		clientToken,
		// Already converted to unsigned UUID
		selectedProfile: selectedProfile?.id ?? null,
	});

	return {
		accessToken: `${session.id}:${session.token}`,
		clientToken,
		// [TODO] Probably move this to a separate method.
		user: body.requestUser ? { id: session.userId, properties: [] } : undefined,
		availableProfiles: yggProfiles,
		selectedProfile: selectedProfile ?? undefined,
	};
}
