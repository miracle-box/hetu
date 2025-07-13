import { Elysia } from 'elysia';
import { uploadTextureAction } from '#modules/yggdrasil/actions/mojangapi/upload-texture.action';
import { uploadTextureDtoSchemas } from '#modules/yggdrasil/dtos/mojangapi/upload-texture.dto';
import {
	ForbiddenOperationException,
	IllegalArgumentException,
	InternalError,
} from '#shared/middlewares/errors/yggdrasil-error';

export const uploadTextureHandler = new Elysia().put(
	'/user/profile/:id/:type',
	async ({ params, body, headers, set }) => {
		const result = await uploadTextureAction({
			accessToken: headers['authorization'],
			profileId: params.id,
			textureType: params.type,
			model: body.model,
			file: body.file,
		});

		return result
			.map(() => {
				set.status = 204;
				return undefined;
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'UserNotFoundError':
						throw new IllegalArgumentException(error.message);
					case 'YggdrasilForbiddenError':
						throw new ForbiddenOperationException(error.message);
					case 'YggdrasilAuthenticationError':
						throw new ForbiddenOperationException(error.message);
					case 'YggdrasilProfileNotFoundError':
						throw new IllegalArgumentException(error.message);
					case 'DatabaseError':
						throw new InternalError(error);
				}
			})
			.extract();
	},
	{
		...uploadTextureDtoSchemas,
		detail: {
			summary: 'Upload Texture',
			description:
				"Upload texture for profile, will automatically create a new texture if it doesn't exist.",
			security: [{ session: [] }],
			tags: ['Yggdrasil'],
		},
	},
);
