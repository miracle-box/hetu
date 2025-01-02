import { db } from '~backend/shared/db';
import { and, eq, gt, inArray } from 'drizzle-orm';
import { profilesTable } from '~backend/shared/db/schema/profiles';
import { Texture } from '~backend/textures/texture.entities';
import { Profile } from '~backend/profiles/profile.entities';
import { yggServerSessionsTable } from '~backend/shared/db/schema/ygg-server-sessions';
import { YggServerSession } from '~backend/yggdrasil/yggdrasil.entities';

export abstract class YggdrasilRepository {
	static async getProfilesDigestByNames(
		names: string[],
	): Promise<Pick<Profile, 'id' | 'name'>[]> {
		return db.query.profilesTable.findMany({
			columns: {
				id: true,
				name: true,
			},
			where: inArray(profilesTable.name, names),
		});
	}

	static async getProfilesDigestByUser(userId: string): Promise<Pick<Profile, 'id' | 'name'>[]> {
		return db.query.profilesTable.findMany({
			columns: {
				id: true,
				name: true,
			},
			where: eq(profilesTable.authorId, userId),
		});
	}

	static async getProfileDigestById(id: string): Promise<Pick<Profile, 'id' | 'name'> | null> {
		return (
			(await db.query.profilesTable.findFirst({
				columns: {
					id: true,
					name: true,
				},
				where: eq(profilesTable.id, id),
			})) ?? null
		);
	}

	static async getProfileDigestWithSkinsById(id: string): Promise<
		| (Pick<Profile, 'id' | 'name'> & {
				skinTexture: Pick<Texture, 'hash' | 'type'> | null;
				capeTexture: Pick<Texture, 'hash' | 'type'> | null;
		  })
		| null
	> {
		return (
			(await db.query.profilesTable.findFirst({
				columns: {
					id: true,
					name: true,
				},
				with: {
					skinTexture: {
						columns: {
							hash: true,
							type: true,
						},
					},
					capeTexture: {
						columns: {
							hash: true,
							type: true,
						},
					},
				},
				where: eq(profilesTable.id, id),
			})) ?? null
		);
	}

	static async getProfileDigestWithSkinsByName(name: string): Promise<
		| (Pick<Profile, 'id' | 'name'> & {
				skinTexture: Pick<Texture, 'hash' | 'type'> | null;
				capeTexture: Pick<Texture, 'hash' | 'type'> | null;
		  })
		| null
	> {
		return (
			(await db.query.profilesTable.findFirst({
				columns: {
					id: true,
					name: true,
				},
				with: {
					skinTexture: {
						columns: {
							hash: true,
							type: true,
						},
					},
					capeTexture: {
						columns: {
							hash: true,
							type: true,
						},
					},
				},
				where: eq(profilesTable.name, name),
			})) ?? null
		);
	}

	static async findJoinRecordById(serverId: string): Promise<YggServerSession | null> {
		return (
			(await db.query.yggServerSessionsTable.findFirst({
				where: and(
					eq(yggServerSessionsTable.serverId, serverId),
					gt(yggServerSessionsTable.expiresAt, new Date()),
				),
			})) ?? null
		);
	}

	static async createJoinRecord(params: {
		serverId: string;
		accessToken: string;
		clientIp: string;
		expiresAt: Date;
	}): Promise<void> {
		await db
			.insert(yggServerSessionsTable)
			.values({
				serverId: params.serverId,
				accessToken: params.accessToken,
				clientIp: params.clientIp,
				expiresAt: params.expiresAt,
			})
			.onConflictDoUpdate({
				target: yggServerSessionsTable.serverId,
				set: {
					expiresAt: params.expiresAt,
				},
			});
	}
}
