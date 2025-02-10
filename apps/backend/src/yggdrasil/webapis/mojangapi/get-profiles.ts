import { Elysia, t } from 'elysia';
import { yggProfileDigestSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';

export const getProfilesHandler = new Elysia().post(
	'/profiles/minecraft',
	async ({ body }) => {
		return (await YggdrasilRepository.getProfilesDigestByNames(body)).map((profile) =>
			YggdrasilService.getYggdrasilProfileDigest(profile),
		);
	},
	{
		body: t.Array(t.String()),
		response: {
			200: t.Array(yggProfileDigestSchema),
		},
		detail: {
			summary: 'Get Profiles',
			description: 'Get profiles of requested users.',
			tags: ['Yggdrasil'],
		},
	},
);
