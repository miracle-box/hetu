import { Elysia } from 'elysia';
import { invalidateAction } from '#modules/yggdrasil/actions/authserver/invalidate.action';
import { invalidateDtoSchemas } from '#modules/yggdrasil/dtos/authserver/invalidate.dto';
import { InternalError } from '#shared/middlewares/errors/yggdrasil-error';

export const invalidateHandler = new Elysia().post(
	'/invalidate',
	async ({ body, set }) => {
		const result = await invalidateAction({
			accessToken: body.accessToken,
			clientToken: body.clientToken,
		});

		return result
			.map(() => {
				set.status = 204;
				return undefined;
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'YggdrasilAuthenticationError':
					case 'UserNotFoundError':
						set.status = 204;
						return undefined;
					case 'DatabaseError':
						throw new InternalError(error);
				}
			})
			.extract();
	},
	{
		...invalidateDtoSchemas,
		detail: {
			summary: 'Invalidate Token',
			description: 'Invalidate the token.',
			tags: ['Yggdrasil'],
		},
	},
);
