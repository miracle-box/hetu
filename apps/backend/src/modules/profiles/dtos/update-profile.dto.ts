import { t } from 'elysia';
import { profileSchema } from '#modules/profiles/profiles.entities';
import { createDtoSchemas } from '#shared/middlewares/dto/schemas';

export const updateProfileDtoSchemas = createDtoSchemas({
	params: t.Object({
		id: t.String(),
	}),
	body: t.Object({
		name: t.Optional(t.String({ minLength: 3, maxLength: 128 })),
		skinTextureId: t.Optional(t.Union([t.String(), t.Null()])),
		capeTextureId: t.Optional(t.Union([t.String(), t.Null()])),
	}),
	response: {
		200: t.Object({
			profile: profileSchema,
		}),
	},
	errors: ['profiles/not-found', 'profiles/name-exists', 'internal-error'],
});
