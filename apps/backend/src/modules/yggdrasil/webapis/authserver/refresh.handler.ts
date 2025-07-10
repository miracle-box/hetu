import { Elysia } from 'elysia';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { ForbiddenOperationException } from '~backend/shared/middlewares/errors/yggdrasil-error';
import { refreshAction } from '../../actions/authserver/refresh.action';
import { refreshDtoSchemas } from '../../dtos/authserver/refresh.dto';

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
