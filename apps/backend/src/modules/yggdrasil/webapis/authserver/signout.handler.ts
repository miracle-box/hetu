import { Elysia } from 'elysia';
import {
	ForbiddenOperationException,
	InternalError,
} from '~backend/shared/middlewares/errors/yggdrasil-error';
import { signoutAction } from '../../actions/authserver/signout.action';
import { signoutDtoSchemas } from '../../dtos/authserver/signout.dto';

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
