import { Elysia } from 'elysia';
import { getProfileAction } from '#modules/yggdrasil/actions/sessionserver/get-profile.action';
import { getProfileDtoSchemas } from '#modules/yggdrasil/dtos/sessionserver/get-profile.dto';
import { InternalError } from '#shared/middlewares/errors/yggdrasil-error';

export const getProfileHandler = new Elysia().get(
	'/session/minecraft/profile/:id',
	async ({ params, query, set }) => {
		const result = await getProfileAction({
			profileId: params.id,
			unsigned: query.unsigned,
		});

		return result
			.map((data) => data)
			.mapLeft((error) => {
				switch (error.name) {
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
		...getProfileDtoSchemas,
		detail: {
			summary: 'Get Profile',
			description: 'Get profile info by UUID.',
			tags: ['Yggdrasil'],
		},
	},
);
