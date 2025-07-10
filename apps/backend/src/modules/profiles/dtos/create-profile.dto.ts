import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { profileSchema } from '../profiles.entities';

export const createProfileDtoSchemas = createDtoSchemas({
	body: t.Object({
		name: t.String({ minLength: 3, maxLength: 128 }),
	}),
	response: {
		201: t.Object({
			profile: profileSchema,
		}),
	},
	errors: ['profiles/name-exists', 'profiles/primary-exists', 'internal-error'],
});
