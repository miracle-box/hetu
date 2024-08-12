import { db } from '~/db/connection';
import { HasJoinedRequest, JoinRequest } from './sessionserver';
import { yggdrasilJoinServerTable } from '~/db/schema/yggdrasil';
import { lucia } from '~/auth/lucia';
import { YggdrasilProfile } from './common';
import { eq } from 'drizzle-orm';
import { CommonService } from './common.service';

export abstract class SessionserverService {
	static async joinServer(body: JoinRequest): Promise<void> {
		// [TODO] Not validating scope currently for simplicity
		const session = await lucia.validateSession(body.accessToken);
		// [TODO] Error handling in Mojang's format
		if (!session) throw new Error('Invalid session!');

		// [TODO] Make this configurable
		const expiresAt = new Date(new Date().getTime() + 30 * 1000);
		await db
			.insert(yggdrasilJoinServerTable)
			.values({
				serverId: body.serverId,
				accessToken: body.accessToken,
				expiresAt,
				// [TODO] record client ip
			})
			.onConflictDoUpdate({
				target: yggdrasilJoinServerTable.serverId,
				set: { expiresAt },
			});
	}

	static async hasJoined(body: HasJoinedRequest): Promise<YggdrasilProfile | null> {
		// [TODO] Support Anylogin
		const [joinRecord] = await db
			.select()
			.from(yggdrasilJoinServerTable)
			.where(eq(yggdrasilJoinServerTable.serverId, body.serverId))
			.limit(1);
		if (!joinRecord) return null;
		if (joinRecord.expiresAt < new Date()) return null;
		// [TODO] Validate client IP
		// [TODO] Validate if username equals to to profile bounded to access token

		return CommonService.getProfileByName(body.username);
	}
}
