import { t } from 'elysia';
import { profileSchema } from '#modules/profiles/profiles.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const createProfileDtoSchemas = createDtoSchemas(
	{
		body: t.Object({
			name: t.String({ minLength: 3, maxLength: 128 }),
		}),
	},
	{
		201: t.Object({
			profile: profileSchema,
		}),
	},
	['profiles/name-exists', 'profiles/primary-exists', 'internal-error'],
);
