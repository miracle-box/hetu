import type { Profile } from '#modules/profiles/profiles.entities';
import type { Texture } from '#modules/textures/textures.entities';
import type { YggServerSession } from '#modules/yggdrasil/yggdrasil.entities';
import type { IYggdrasilRepository } from '#modules/yggdrasil/yggdrasil.repository.interface';
import { and, eq, gt, inArray } from 'drizzle-orm';
import { Either, Left, Right } from 'purify-ts';
import { DatabaseError } from '#common/errors/base.error';
import { useDatabase } from '#db';
import { profilesTable } from '#db/schema/profiles';
import { yggServerSessionsTable } from '#db/schema/ygg-server-sessions';

export const YggdrasilRepository: IYggdrasilRepository = {
	async getProfilesDigestByNames(
		names: string[],
	): Promise<Either<DatabaseError, Pick<Profile, 'id' | 'name'>[]>> {
		try {
			const db = useDatabase();

			const profiles = await db.query.profilesTable.findMany({
				columns: {
					id: true,
					name: true,
				},
				where: inArray(profilesTable.name, names),
			});

			return Right(profiles);
		} catch (error) {
			return Left(new DatabaseError('Failed to get profiles digest by names', error));
		}
	},

	async getProfilesDigestByUser(
		userId: string,
	): Promise<Either<DatabaseError, Pick<Profile, 'id' | 'name'>[]>> {
		try {
			const db = useDatabase();

			const profiles = await db.query.profilesTable.findMany({
				columns: {
					id: true,
					name: true,
				},
				where: eq(profilesTable.authorId, userId),
			});

			return Right(profiles);
		} catch (error) {
			return Left(new DatabaseError('Failed to get profiles digest by user', error));
		}
	},

	async getProfileDigestById(
		id: string,
	): Promise<Either<DatabaseError, Pick<Profile, 'id' | 'name'> | null>> {
		try {
			const db = useDatabase();

			const profile = await db.query.profilesTable.findFirst({
				columns: {
					id: true,
					name: true,
				},
				where: eq(profilesTable.id, id),
			});

			return Right(profile ?? null);
		} catch (error) {
			return Left(new DatabaseError('Failed to get profile digest by ID', error));
		}
	},

	async getProfileDigestWithSkinsById(id: string): Promise<
		Either<
			DatabaseError,
			| (Pick<Profile, 'id' | 'name'> & {
					skinTexture: Pick<Texture, 'hash' | 'type'> | null;
					capeTexture: Pick<Texture, 'hash' | 'type'> | null;
			  })
			| null
		>
	> {
		try {
			const db = useDatabase();

			const profile = await db.query.profilesTable.findFirst({
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
			});

			return Right(profile ?? null);
		} catch (error) {
			return Left(new DatabaseError('Failed to get profile digest with skins by ID', error));
		}
	},

	async getProfileDigestWithSkinsByName(name: string): Promise<
		Either<
			DatabaseError,
			| (Pick<Profile, 'id' | 'name'> & {
					skinTexture: Pick<Texture, 'hash' | 'type'> | null;
					capeTexture: Pick<Texture, 'hash' | 'type'> | null;
			  })
			| null
		>
	> {
		try {
			const db = useDatabase();

			const profile = await db.query.profilesTable.findFirst({
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
			});

			return Right(profile ?? null);
		} catch (error) {
			return Left(
				new DatabaseError('Failed to get profile digest with skins by name', error),
			);
		}
	},

	async findJoinRecordByServerId(
		serverId: string,
	): Promise<Either<DatabaseError, YggServerSession | null>> {
		try {
			const db = useDatabase();

			const session = await db.query.yggServerSessionsTable.findFirst({
				where: and(
					eq(yggServerSessionsTable.serverId, serverId),
					gt(yggServerSessionsTable.expiresAt, new Date()),
				),
			});

			return Right(session ?? null);
		} catch (error) {
			return Left(new DatabaseError('Failed to find join record by ID', error));
		}
	},

	async createJoinRecord(params: {
		serverId: string;
		accessToken: string;
		clientIp: string;
		expiresAt: Date;
	}): Promise<Either<DatabaseError, void>> {
		try {
			const db = useDatabase();

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

			return Right(undefined);
		} catch (error) {
			return Left(new DatabaseError('Failed to create join record', error));
		}
	},
};
