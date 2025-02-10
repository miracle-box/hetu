import { Elysia, NotFoundError, t } from 'elysia';
import { yggProfileSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';

export const getProfileHandler = new Elysia().get(
	'/session/minecraft/profile/:id',
	async ({ params, query }) => {
		const unsigned = query.unsigned ?? true;
		const profileWithSkins = await YggdrasilRepository.getProfileDigestWithSkinsById(params.id);
		if (!profileWithSkins) throw new NotFoundError();

		return YggdrasilService.getYggdrasilProfile(profileWithSkins, !unsigned);
	},
	{
		params: t.Object({
			id: t.String(),
		}),
		query: t.Object({
			unsigned: t.Optional(t.Boolean()),
		}),
		response: {
			200: yggProfileSchema,
		},
		detail: {
			summary: 'Get Profile',
			description: 'Get profile info by UUID.',
			tags: ['Yggdrasil'],
		},
	},
);
