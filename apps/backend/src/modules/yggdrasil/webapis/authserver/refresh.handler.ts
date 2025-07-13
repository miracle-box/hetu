import { Elysia } from 'elysia';
import { refreshAction } from '#modules/yggdrasil/actions/authserver/refresh.action';
import { refreshDtoSchemas } from '#modules/yggdrasil/dtos/authserver/refresh.dto';
import { AppError } from '#shared/middlewares/errors/app-error';
import { ForbiddenOperationException } from '#shared/middlewares/errors/yggdrasil-error';

export const refreshHandler = new Elysia().post(
	'/refresh',
	async ({ body }) => {
		const result = await refreshAction({
			accessToken: body.accessToken,
			clientToken: body.clientToken,
			requestUser: body.requestUser,
			selectedProfile: body.selectedProfile,
		});

		return result
			.mapLeft((error) => {
				switch (error.name) {
					case 'YggdrasilAuthenticationError':
						throw new ForbiddenOperationException(error.message);
					case 'UserNotFoundError':
						throw new ForbiddenOperationException(error.message);
					case 'DatabaseError':
						throw new AppError('internal-error');
				}
			})
			.extract();
	},
	{
		...refreshDtoSchemas,
		detail: {
			summary: 'Refresh Token',
			description: 'Get a new token and invalidate the old one.',
			tags: ['Yggdrasil'],
		},
	},
);
