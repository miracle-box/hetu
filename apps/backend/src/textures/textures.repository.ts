import { createSelectSchema } from 'drizzle-typebox';
import { texturesTable } from '~/shared/db/schema/textures';
import { Static } from 'elysia';
import { db } from '~/shared/db';
import { eq } from 'drizzle-orm';

const textureRecord = createSelectSchema(texturesTable);

type TextureRecord = Static<typeof textureRecord>;

export abstract class TexturesRepository {
	static async findById(id: string): Promise<TextureRecord | null> {
		const texture = await db.query.texturesTable.findFirst({
			where: eq(texturesTable.id, id),
		});

		return texture ?? null;
	}
}
