import { Static, t } from 'elysia';

export const yggCredentialsSchema = t.Object({
	username: t.String(),
	password: t.String(),
});

export const yggTokenSchema = t.Object({
	accessToken: t.String(),
	clientToken: t.Optional(t.String()),
});

export const yggServerSessionSchema = t.Object({
	accessToken: t.String(),
	clientIp: t.Nullable(t.String()),
	expiresAt: t.Date(),
	serverId: t.String(),
});

export const yggUserSchema = t.Object({
	id: t.String(),
	properties: t.Array(
		t.Object({
			name: t.String(),
			value: t.String(),
		}),
	),
});

export const yggProfileSchema = t.Object({
	id: t.String(),
	name: t.String(),
	properties: t.Array(
		t.Object({
			name: t.String(),
			value: t.String(),
			signature: t.Optional(t.String()),
		}),
	),
});

export const yggProfileDigestSchema = t.Omit(yggProfileSchema, ['properties']);

export const yggTextureSchema = t.Object({
	url: t.String({ format: 'uri' }),
	metadata: t.Optional(
		t.Object({
			model: t.Union([t.Literal('default'), t.Literal('slim')]),
		}),
	),
});

export const yggdrasilProfileTexturesSchema = t.Object({
	timestamp: t.Number(),
	profileId: t.String(),
	profileName: t.String(),
	textures: t.Record(t.String(), yggTextureSchema),
});

export type YggCredentials = Static<typeof yggCredentialsSchema>;
export type YggToken = Static<typeof yggTokenSchema>;
export type YggServerSession = Static<typeof yggServerSessionSchema>;
export type YggUser = Static<typeof yggUserSchema>;
export type YggProfile = Static<typeof yggProfileSchema>;
export type YggProfileDigest = Static<typeof yggProfileDigestSchema>;
export type YggTexture = Static<typeof yggTextureSchema>;
export type YggProfileTextures = Static<typeof yggdrasilProfileTexturesSchema>;
