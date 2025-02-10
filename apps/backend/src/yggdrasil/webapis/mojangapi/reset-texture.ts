import { Elysia, t } from 'elysia';
import { SessionScope } from '~backend/auth/auth.entities';
import { ProfilesRepository } from '~backend/profiles/profiles.repository';
import { authMiddleware } from '~backend/shared/auth/middleware';

export const resetTextureHandler = new Elysia().use(authMiddleware(SessionScope.YGGDRASIL)).delete(
	'/user/profile/:id/:type',
	async ({ params, set }) => {
		if (params.type === 'skin')
			await ProfilesRepository.update(params.id, { skinTextureId: null });
		if (params.type === 'cape')
			await ProfilesRepository.update(params.id, { capeTextureId: null });

		set.status = 'No Content';
	},
	{
		params: t.Object({
			id: t.String(),
			type: t.Union([t.Literal('skin'), t.Literal('cape')]),
		}),
		response: {
			204: t.Void(),
		},
		detail: {
			summary: 'Reset Texture',
			description: 'Reset texture to default.',
			security: [{ session: [] }],
			tags: ['Yggdrasil'],
		},
	},
);
