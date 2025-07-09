import { Elysia } from 'elysia';
import {
	ForbiddenOperationException,
	IllegalArgumentException,
	InternalError,
} from '~backend/shared/middlewares/errors/yggdrasil-error';
import { resetTextureAction } from '../../actions/mojangapi/reset-texture.action';
import { resetTextureDtoSchemas } from '../../dtos/mojangapi/reset-texture.dto';

export const resetTextureHandler = new Elysia().delete(
	'/user/profile/:id/:type',
	async ({ params, headers, set }) => {
		const result = await resetTextureAction({
			accessToken: headers['authorization'],
			profileId: params.id,
			textureType: params.type,
		});

		return result
			.map(() => {
				set.status = 204;
				return undefined;
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'YggdrasilForbiddenError':
						throw new ForbiddenOperationException(error.message);
					case 'YggdrasilAuthenticationError':
						throw new ForbiddenOperationException(error.message);
					case 'UserNotFoundError':
						throw new IllegalArgumentException(error.message);
					case 'YggdrasilProfileNotFoundError':
						throw new IllegalArgumentException(error.message);
					case 'DatabaseError':
						throw new InternalError(error);
				}
			})
			.extract();
	},
	{
		...resetTextureDtoSchemas,
		detail: {
			summary: 'Reset Texture',
			description: 'Reset texture to default.',
			security: [{ session: [] }],
			tags: ['Yggdrasil'],
		},
	},
);
