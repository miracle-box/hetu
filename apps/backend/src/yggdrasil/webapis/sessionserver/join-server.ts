import { Static, t } from 'elysia';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';
import { Session, SessionScope } from '~backend/auth/auth.entities';

export const joinServerBodySchema = t.Object({
	accessToken: t.String(),
	selectedProfile: t.String(),
	serverId: t.String(),
});
export const joinServerResponseSchema = t.Void();

export async function joinServer(
	body: Static<typeof joinServerBodySchema>,
	session: Session<typeof SessionScope.YGGDRASIL>,
): Promise<Static<typeof joinServerResponseSchema>> {
	// [TODO] Make this configurable
	const expiresAt = new Date(new Date().getTime() + 30 * 1000);
	await YggdrasilRepository.createJoinRecord({
		serverId: body.serverId,
		accessToken: session.id,
		// [TODO] Client IP recording
		clientIp: '',
		expiresAt,
	});
}
