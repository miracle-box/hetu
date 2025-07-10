import { Elysia } from 'elysia';
import {
	ForbiddenOperationException,
	InternalError,
} from '~backend/shared/middlewares/errors/yggdrasil-error';
import { joinServerAction } from '../../actions/sessionserver/join-server.action';
import { joinServerDtoSchemas } from '../../dtos/sessionserver/join-server.dto';

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
