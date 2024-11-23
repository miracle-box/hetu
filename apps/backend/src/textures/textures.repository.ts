import { createSelectSchema } from 'drizzle-typebox';
import { texturesTable } from '~/shared/db/schema/textures';
import { Static } from 'elysia';
import { db } from '~/shared/db';
import { and, eq } from 'drizzle-orm';
import { TextureType } from '~/textures/texture.entities';
import { filesTable } from '~/shared/db/schema/files';

const textureRecord = createSelectSchema(texturesTable);
const fileRecord = createSelectSchema(filesTable);

type TextureRecord = Static<typeof textureRecord>;

export abstract class TexturesRepository {
	static async findById(id: string): Promise<TextureRecord | null> {
		const texture = await db.query.texturesTable.findFirst({
			where: eq(texturesTable.id, id),
		});

		return texture ?? null;
	}

	static async findUserTextureByHash(
		userId: string,
		type: TextureType,
		hash: string,
	): Promise<TextureRecord | null> {
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
		params: Pick<TextureRecord, 'authorId' | 'name' | 'description' | 'type' | 'hash'>,
	): Promise<TextureRecord> {
		const [insertedTexture] = await db.insert(texturesTable).values(params).returning();
		if (!insertedTexture) {
			throw new Error('Failed to create texture.');
		}

		return insertedTexture;
	}
}
