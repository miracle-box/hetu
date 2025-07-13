import { Elysia } from 'elysia';
import { hasJoinedAction } from '#modules/yggdrasil/actions/sessionserver/has-joined.action';
import { hasJoinedDtoSchemas } from '#modules/yggdrasil/dtos/sessionserver/has-joined.dto';
import { InternalError } from '#shared/middlewares/errors/yggdrasil-error';

export const hasJoinedHandler = new Elysia().get(
	'/session/minecraft/hasJoined',
	async ({ query, set }) => {
		const result = await hasJoinedAction({
			username: query.username,
			serverId: query.serverId,
		});

		return result
			.map((data) => {
				return data;
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'UserNotFoundError':
					case 'YggdrasilAuthenticationError':
					case 'YggdrasilServerSessionNotFoundError':
					case 'YggdrasilProfileNotFoundError':
						set.status = 204;
						return undefined;
					case 'DatabaseError':
						throw new InternalError(error);
				}
			})
			.extract();
	},
	{
		...hasJoinedDtoSchemas,
		detail: {
			summary: 'Validate Client',
			description: 'Validates client and get their profile.',
			tags: ['Yggdrasil'],
		},
	},
);
