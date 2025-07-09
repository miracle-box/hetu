import { Elysia } from 'elysia';
import { InternalError } from '~backend/shared/middlewares/errors/yggdrasil-error';
import { getProfilesAction } from '../../actions/mojangapi/get-profiles.action';
import { getProfilesDtoSchemas } from '../../dtos/mojangapi/get-profiles.dto';

export const getProfilesHandler = new Elysia().post(
	'/profiles/minecraft',
	async ({ body }) => {
		const result = await getProfilesAction({
			usernames: body,
		});

		return result
			.map((data) => data)
			.mapLeft((error) => {
				switch (error.name) {
					case 'DatabaseError':
						throw new InternalError(error);
				}
			})
			.extract();
	},
	{
		...getProfilesDtoSchemas,
		detail: {
			summary: 'Get Profiles',
			description: 'Get profiles of requested users.',
			tags: ['Yggdrasil'],
		},
	},
);
