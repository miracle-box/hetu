import { Elysia } from 'elysia';
import { validateAction } from '#modules/yggdrasil/actions/authserver/validate.action';
import { validateDtoSchemas } from '#modules/yggdrasil/dtos/authserver/validate.dto';
import {
	ForbiddenOperationException,
	InternalError,
} from '#shared/middlewares/errors/yggdrasil-error';

export const validateHandler = new Elysia().post(
	'/validate',
	async ({ body, set }) => {
		const result = await validateAction({
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
						throw new ForbiddenOperationException(error.message);
					case 'UserNotFoundError':
						throw new ForbiddenOperationException(error.message);
					case 'DatabaseError':
						throw new InternalError(error);
				}
			})
			.extract();
	},
	{
		...validateDtoSchemas,
		detail: {
			summary: 'Validate Token',
			description: 'Check if the token is valid.',
			tags: ['Yggdrasil'],
		},
	},
);
