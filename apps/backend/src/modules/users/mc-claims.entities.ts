import type { EnumLikeValues } from '#shared/typing/utils';
import type { Static } from 'elysia';
import { t } from 'elysia';

export const SkinTextureVariant = {
	CLASSIC: 'classic',
	SLIM: 'slim',
} as const;

export const minecraftClaimSchema = t.Object({
	id: t.String(),
	userId: t.String(),
	mcUuid: t.String(),
	mcUsername: t.String(),
	skinTextureUrl: t.Nullable(t.String()),
	skinTextureVariant: t.Nullable(t.Enum(SkinTextureVariant)),
	capeTextureUrl: t.Nullable(t.String()),
	capeTextureAlias: t.Nullable(t.String()),
	boundProfileId: t.Nullable(t.String()),
	createdAt: t.Date(),
	updatedAt: t.Date(),
});

export type SkinTextureVariant = EnumLikeValues<typeof SkinTextureVariant>;
export type MinecraftClaim = Static<typeof minecraftClaimSchema>;
