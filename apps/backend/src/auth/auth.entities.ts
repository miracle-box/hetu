import { Static, t, TSchema } from 'elysia';
import { TLiteral } from '@sinclair/typebox';
import { createEnumLikeValuesSchema, EnumLikeValues, Prettify } from '~backend/shared/typing/utils';

export const UserAuthType = {
	PASSWORD: 'password',
} as const;

export const SessionScope = {
	DEFAULT: 'default',
	YGGDRASIL: 'yggdrasil',
} as const;

export const userAuthTypeSchema = createEnumLikeValuesSchema(UserAuthType);
export const sessionScopeSchema = createEnumLikeValuesSchema(SessionScope);

// Metadata differs between scopes.
export const sessionMetadataSchema = <TScope extends TSchema>(TScope: TScope) =>
	t.Extract(
		t.Union([
			t.Object({
				scope: t.Literal(SessionScope.DEFAULT),
			}),
			t.Object({
				scope: t.Literal(SessionScope.YGGDRASIL),
				clientToken: t.String(),
				selectedProfile: t.Nullable(t.String()),
			}),
		]),
		t.Object({
			scope: TScope,
		}),
	);

export const sessionSchema = <TScope extends TSchema>(TScope: TScope) =>
	t.Object({
		id: t.String(),
		token: t.String(),
		userId: t.String(),
		expiresAt: t.Date(),
		metadata: sessionMetadataSchema(TScope),
	});

export const sessionDigestSchema = <TScope extends TSchema>(TScope: TScope) =>
	t.Omit(sessionSchema(TScope), ['token']);

export type UserAuthType = EnumLikeValues<typeof UserAuthType>;
export type SessionScope = EnumLikeValues<typeof SessionScope>;
// Represent any session by default
export type SessionMetadata<TScope extends SessionScope = SessionScope> = Prettify<
	Static<ReturnType<typeof sessionMetadataSchema<TLiteral<TScope>>>>
>;
export type Session<TScope extends SessionScope = SessionScope> = Prettify<
	Static<ReturnType<typeof sessionSchema<TLiteral<TScope>>>>
>;
export type SessionDigest<TScope extends SessionScope = SessionScope> = Prettify<
	Static<ReturnType<typeof sessionDigestSchema<TLiteral<TScope>>>>
>;
