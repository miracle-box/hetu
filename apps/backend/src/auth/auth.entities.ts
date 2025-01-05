import { Static, t } from 'elysia';
import { EnumLikeValues } from '~backend/shared/typing/utils';

export const UserAuthType = {
	PASSWORD: 'password',
} as const;

export const SessionScope = {
	DEFAULT: 'default',
	YGGDRASIL: 'yggdrasil',
} as const;

// Metadata differs between scopes.
export const sessionMetadataSchema = t.Union([
	t.Object({
		scope: t.Literal(SessionScope.DEFAULT),
	}),
	t.Object({
		scope: t.Literal(SessionScope.YGGDRASIL),
		clientToken: t.String(),
	}),
]);

export const sessionSchema = t.Object({
	id: t.String(),
	token: t.String(),
	userId: t.String(),
	metadata: sessionMetadataSchema,
	expiresAt: t.Date(),
});

export const sessionDigestSchema = t.Omit(sessionSchema, ['token']);

export type UserAuthType = EnumLikeValues<typeof UserAuthType>;
export type SessionScope = EnumLikeValues<typeof SessionScope>;
export type SessionMetadata = Static<typeof sessionMetadataSchema>;
export type Session = Static<typeof sessionSchema>;
export type SessionDigest = Static<typeof sessionDigestSchema>;
