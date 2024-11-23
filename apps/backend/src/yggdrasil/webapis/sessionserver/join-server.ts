import { Static, t } from 'elysia';
import { YggdrasilRepository } from '~/yggdrasil/yggdrasil.repository';
import { SessionService } from '~/services/auth/session';

export const joinServerBodySchema = t.Object({
	accessToken: t.String(),
	selectedProfile: t.String(),
	serverId: t.String(),
});
export const joinServerResponseSchema = t.Void();

export async function joinServer(
	body: Static<typeof joinServerBodySchema>,
): Promise<Static<typeof joinServerResponseSchema>> {
	const session = await SessionService.validate(body.accessToken);
	if (!session) throw new Error('Invalid session!');

	// [TODO] Make this configurable
	const expiresAt = new Date(new Date().getTime() + 30 * 1000);
	await YggdrasilRepository.createJoinRecord({
		serverId: body.serverId,
		accessToken: body.accessToken,
		// [TODO] Client IP recording
		clientIp: '',
		expiresAt,
	});
}
