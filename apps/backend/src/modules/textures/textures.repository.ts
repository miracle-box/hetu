import type { Texture, TextureType } from '#modules/textures/textures.entities';
import type { ITexturesRepository } from '#modules/textures/textures.repository.interface';
import { and, eq } from 'drizzle-orm';
import { Either, Left, Right } from 'purify-ts';
import { DatabaseError } from '#common/errors/base.error';
import { useDatabase } from '#db';
import { texturesTable } from '#db/schema/textures';

export const TexturesRepository: ITexturesRepository = {
	async findTexturesByUser(userId: string): Promise<Either<DatabaseError, Texture[]>> {
		try {
			const db = useDatabase();

			const textures = await db.query.texturesTable.findMany({
				where: eq(texturesTable.authorId, userId),
			});

			return Right(textures);
		} catch (error) {
			return Left(new DatabaseError('Failed to find user textures', error));
		}
	},

	async findTextureById(id: string): Promise<Either<DatabaseError, Texture | null>> {
		try {
			const db = useDatabase();

			const texture = await db.query.texturesTable.findFirst({
				where: eq(texturesTable.id, id),
			});

			return Right(texture ?? null);
		} catch (error) {
			return Left(new DatabaseError('Failed to find texture by ID', error));
		}
	},

	async findUserTextureByHash(
		userId: string,
		type: TextureType,
		hash: string,
	): Promise<Either<DatabaseError, Texture | null>> {
		try {
			const db = useDatabase();

			const texture = await db.query.texturesTable.findFirst({
				where: and(
					eq(texturesTable.authorId, userId),
					eq(texturesTable.hash, hash),
					eq(texturesTable.type, type),
				),
			});

			return Right(texture ?? null);
		} catch (error) {
			return Left(new DatabaseError('Failed to find user texture by hash', error));
		}
	},

	async createTexture(
		params: Pick<Texture, 'authorId' | 'name' | 'description' | 'type' | 'hash'>,
	): Promise<Either<DatabaseError, Texture>> {
		try {
			const db = useDatabase();

			const [insertedTexture] = await db.insert(texturesTable).values(params).returning();

			if (!insertedTexture) {
				return Left(
					new DatabaseError('Failed to create texture', 'No texture record returned'),
				);
			}

			return Right(insertedTexture);
		} catch (error) {
			return Left(new DatabaseError('Failed to create texture', error));
		}
	},

	async updateTexture(
		id: string,
		params: Partial<Pick<Texture, 'name' | 'description'>>,
	): Promise<Either<DatabaseError, Texture>> {
		try {
			const db = useDatabase();

			const [updatedTexture] = await db
				.update(texturesTable)
				.set(params)
				.where(eq(texturesTable.id, id))
				.returning();

			if (!updatedTexture) {
				return Left(
					new DatabaseError('Failed to update texture', 'No texture record returned'),
				);
			}

			return Right(updatedTexture);
		} catch (error) {
			return Left(new DatabaseError('Failed to update texture', error));
		}
	},

	async deleteTexture(id: string): Promise<Either<DatabaseError, void>> {
		try {
			const db = useDatabase();

			await db.delete(texturesTable).where(eq(texturesTable.id, id));

			return Right(undefined);
		} catch (error) {
			return Left(new DatabaseError('Failed to delete texture', error));
		}
	},
};
