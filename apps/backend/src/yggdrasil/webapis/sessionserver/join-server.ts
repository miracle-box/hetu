import { Elysia, t } from 'elysia';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';
import { ForbiddenOperationException } from '~backend/yggdrasil/utils/errors';
import { validateTokenMiddleware } from '~backend/yggdrasil/validate-token.middleware';

export const joinServerHandler = new Elysia().use(validateTokenMiddleware(false)).post(
	'/session/minecraft/join',
	async ({ body, set, session }) => {
		{
			if (session.metadata.selectedProfile !== body.selectedProfile)
				throw new ForbiddenOperationException('Invalid profile selected.');

			// [TODO] Make this configurable (30s for now)
			const expiresAt = new Date(new Date().getTime() + 30 * 1000);
			await YggdrasilRepository.createJoinRecord({
				serverId: body.serverId,
				accessToken: session.id,
				// [TODO] Client IP recording
				clientIp: '',
				expiresAt,
			});
		}

		set.status = 'No Content';
	},
	{
		body: t.Object({
			accessToken: t.String(),
			selectedProfile: t.String(),
			serverId: t.String(),
		}),
		response: {
			204: t.Void(),
		},
		detail: {
			summary: 'Join Server',
			description: 'Log client info for validation.',
			tags: ['Yggdrasil'],
		},
	},
);
