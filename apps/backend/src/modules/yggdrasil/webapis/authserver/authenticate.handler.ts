import { Elysia } from 'elysia';
import { authenticateAction } from '#modules/yggdrasil/actions/authserver/authenticate.action';
import { authenticateDtoSchemas } from '#modules/yggdrasil/dtos/authserver/authenticate.dto';
import {
	ForbiddenOperationException,
	InternalError,
} from '#shared/middlewares/errors/yggdrasil-error';

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
