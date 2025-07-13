import { Elysia } from 'elysia';
import { signoutAction } from '#modules/yggdrasil/actions/authserver/signout.action';
import { signoutDtoSchemas } from '#modules/yggdrasil/dtos/authserver/signout.dto';
import {
	ForbiddenOperationException,
	InternalError,
} from '#shared/middlewares/errors/yggdrasil-error';

export const signoutHandler = new Elysia().post(
	'/signout',
	async ({ body, set }) => {
		const result = await signoutAction({
			username: body.username,
			password: body.password,
		});

		return result
			.map(() => {
				set.status = 204;
				return undefined;
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'YggdrasilInvalidCredentialsError':
						throw new ForbiddenOperationException(error.message);
					case 'DatabaseError':
						throw new InternalError(error);
				}
			})
			.extract();
	},
	{
		...signoutDtoSchemas,
		detail: {
			summary: 'Sign Out',
			description: 'Invalidate all tokens of the user.',
			tags: ['Yggdrasil'],
		},
	},
);
