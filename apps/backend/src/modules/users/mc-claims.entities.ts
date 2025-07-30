import { Type, type Static } from '@sinclair/typebox';
import { createEnumLikeValuesSchema, type EnumLikeValues } from '#shared/typing/utils';

export const SkinTextureVariant = {
	CLASSIC: 'classic',
	SLIM: 'slim',
} as const;

export const minecraftClaimSchema = Type.Object({
	id: Type.String(),
	userId: Type.String(),
	mcUuid: Type.String(),
	mcUsername: Type.String(),
	skinTextureUrl: Type.Union([Type.String(), Type.Null()]),
	skinTextureVariant: Type.Union([createEnumLikeValuesSchema(SkinTextureVariant), Type.Null()]),
	capeTextureUrl: Type.Union([Type.String(), Type.Null()]),
	capeTextureAlias: Type.Union([Type.String(), Type.Null()]),
	boundProfileId: Type.Union([Type.String(), Type.Null()]),
	createdAt: Type.Date(),
	updatedAt: Type.Date(),
});

export type SkinTextureVariant = EnumLikeValues<typeof SkinTextureVariant>;
export type MinecraftClaim = Static<typeof minecraftClaimSchema>;
