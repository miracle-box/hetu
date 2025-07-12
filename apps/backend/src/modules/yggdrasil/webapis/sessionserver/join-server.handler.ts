import { Elysia } from 'elysia';
import { joinServerAction } from '#modules/yggdrasil/actions/sessionserver/join-server.action';
import { joinServerDtoSchemas } from '#modules/yggdrasil/dtos/sessionserver/join-server.dto';
import {
	ForbiddenOperationException,
	InternalError,
} from '#shared/middlewares/errors/yggdrasil-error';

export const joinServerHandler = new Elysia().post(
	'/session/minecraft/join',
	async ({ body, set }) => {
		const result = await joinServerAction({
			accessToken: body.accessToken,
			selectedProfile: body.selectedProfile,
			serverId: body.serverId,
		});

		return result
			.map(() => {
				set.status = 204;
				return undefined;
			})
			.mapLeft((error) => {
				switch (error.name) {
					case 'UserNotFoundError':
						throw new ForbiddenOperationException(error.message);
					case 'YggdrasilAuthenticationError':
						throw new ForbiddenOperationException(error.message);
					case 'DatabaseError':
						throw new InternalError(error);
				}
			})
			.extract();
	},
	{
		...joinServerDtoSchemas,
		detail: {
			summary: 'Join Server',
			description: 'Log client info for validation.',
			tags: ['Yggdrasil'],
		},
	},
);
