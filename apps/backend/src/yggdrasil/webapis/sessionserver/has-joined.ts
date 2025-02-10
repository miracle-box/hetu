import { Elysia, t } from 'elysia';
import { yggProfileSchema } from '~backend/yggdrasil/yggdrasil.entities';
import { YggdrasilRepository } from '~backend/yggdrasil/yggdrasil.repository';
import { YggdrasilService } from '~backend/yggdrasil/yggdrasil.service';

export const hasJoinedHandler = new Elysia().get(
	'/session/minecraft/hasJoined',
	async ({ query, set }) => {
		// [TODO] Support Anylogin
		const joinRecord = await YggdrasilRepository.findJoinRecordById(query.serverId);
		if (!joinRecord) {
			set.status = 'No Content';
			return;
		}

		// [TODO] Validate client IP
		// [TODO] Validate if username equals to to profile bounded to access token

		const profileRecord = await YggdrasilRepository.getProfileDigestWithSkinsByName(
			query.username,
		);
		if (!profileRecord) {
			set.status = 'No Content';
			return;
		}

		return YggdrasilService.getYggdrasilProfile(profileRecord, true);
	},
	{
		query: t.Object({
			username: t.String(),
			serverId: t.String(),
			ip: t.Optional(t.String()),
		}),
		response: {
			200: yggProfileSchema,
			204: t.Void(),
		},
		detail: {
			summary: 'Validate Client',
			description: 'Validates client and get their profile.',
			tags: ['Yggdrasil'],
		},
	},
);
