import { Elysia } from 'elysia';
import { getPlayerUuidAction } from '#modules/yggdrasil/actions/mojangapi/get-player-uuid.action';
import { getPlayerUuidDtoSchemas } from '#modules/yggdrasil/dtos/mojangapi/get-player-uuid.dto';
import { InternalError, NotFoundError } from '#shared/middlewares/errors/yggdrasil-error';

export const getPlayerUuidHandler = new Elysia()
	.get(
		'/profiles/minecraft/:name',
		async ({ params }) => {
			const result = await getPlayerUuidAction({
				name: params.name,
			});

			return result
				.map((data) => data)
				.mapLeft((error) => {
					switch (error.name) {
						case 'YggdrasilProfileNotFoundError':
							throw new NotFoundError('Player not found');
						case 'DatabaseError':
							throw new InternalError(error);
					}
				})
				.extract();
		},
		{
			...getPlayerUuidDtoSchemas,
			detail: {
				summary: 'Get Player UUID (Mojang API)',
				description: 'Get profile UUID by player name (case insensitive).',
				tags: ['Yggdrasil'],
			},
		},
	)
	.get(
		'/minecraftservices/minecraft/profile/lookup/name/:name',
		async ({ params }) => {
			const result = await getPlayerUuidAction({
				name: params.name,
			});

			return result
				.map((data) => data)
				.mapLeft((error) => {
					switch (error.name) {
						case 'YggdrasilProfileNotFoundError':
							throw new NotFoundError('Player not found');
						case 'DatabaseError':
							throw new InternalError(error);
					}
				})
				.extract();
		},
		{
			...getPlayerUuidDtoSchemas,
			detail: {
				summary: 'Get Player UUID (Minecraft Services)',
				description: 'Get profile UUID by player name (case insensitive)',
				tags: ['Yggdrasil'],
			},
		},
	);
