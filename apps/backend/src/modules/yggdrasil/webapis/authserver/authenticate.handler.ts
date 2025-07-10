import { Elysia } from 'elysia';
import {
	ForbiddenOperationException,
	InternalError,
} from '~backend/shared/middlewares/errors/yggdrasil-error';
import { authenticateAction } from '../../actions/authserver/authenticate.action';
import { authenticateDtoSchemas } from '../../dtos/authserver/authenticate.dto';

export const authenticateHandler = new Elysia().post(
	'/authenticate',
	async ({ body }) => {
		const result = await authenticateAction({
			username: body.username,
			password: body.password,
			clientToken: body.clientToken,
			requestUser: body.requestUser,
			agent: body.agent,
		});

		return result
			.map((data) => data)
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
		...authenticateDtoSchemas,
		detail: {
			summary: 'Sign in',
			description: 'Sign in by email and password.',
			tags: ['Yggdrasil'],
		},
	},
);
