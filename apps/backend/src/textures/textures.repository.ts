import type { Texture } from '~backend/textures/texture.entities';
import { and, eq } from 'drizzle-orm';
import { useDatabase } from '~backend/shared/db';
import { texturesTable } from '~backend/shared/db/schema/textures';
import { TextureType } from '~backend/textures/texture.entities';

export abstract class TexturesRepository {
	static async findByUser(userId: string): Promise<Texture[]> {
		const db = useDatabase();

		return db.query.texturesTable.findMany({
			where: eq(texturesTable.authorId, userId),
		});
	}

	static async findById(id: string): Promise<Texture | null> {
		const db = useDatabase();

		const texture = await db.query.texturesTable.findFirst({
			where: eq(texturesTable.id, id),
		});

		return texture ?? null;
	}

	static async findUserTextureByHash(
		userId: string,
		type: TextureType,
		hash: string,
	): Promise<Texture | null> {
		const db = useDatabase();

		const texture = await db.query.texturesTable.findFirst({
			where: and(
				eq(texturesTable.authorId, userId),
				eq(texturesTable.hash, hash),
				eq(texturesTable.type, type),
			),
		});

		return texture ?? null;
	}

	static async create(
		params: Pick<Texture, 'authorId' | 'name' | 'description' | 'type' | 'hash'>,
	): Promise<Texture> {
		const db = useDatabase();

		const [insertedTexture] = await db.insert(texturesTable).values(params).returning();
		if (!insertedTexture) {
			throw new Error('Failed to create texture.');
		}

		return insertedTexture;
	}
}
