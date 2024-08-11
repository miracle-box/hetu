import { Static, t } from 'elysia';

export const userSchema = t.Object({
	id: t.String(),
	properties: t.Array(
		t.Object({
			name: t.String(),
			value: t.String(),
		}),
	),
});

export const profileSchema = t.Object({
	id: t.String(),
	name: t.String(),
	properties: t.Optional(
		t.Array(
			t.Object({
				name: t.String(),
				value: t.String(),
				signature: t.Optional(t.String()),
			}),
		),
	),
});

export const textureSchema = t.Object({
	url: t.String({ format: 'uri' }),
	metadata: t.Object({
		model: t.Union([t.Literal('default'), t.Literal('slim')]),
	}),
});

export const profileTexturesSchema = t.Object({
	timestamp: t.Number(),
	profileId: t.String(),
	profileName: t.String(),
	textures: t.Record(t.String(), textureSchema),
});

export type User = Static<typeof userSchema>;
export type Profile = Static<typeof profileSchema>;
export type Texture = Static<typeof textureSchema>;
export type ProfileTextures = Static<typeof profileTexturesSchema>;