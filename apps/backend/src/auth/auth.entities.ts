import type { TLiteral } from '@sinclair/typebox';
import type { Static, TSchema } from 'elysia';
import type { EnumLikeValues, Prettify } from '~backend/shared/typing/utils';
import { t } from 'elysia';
import { createEnumLikeValuesSchema } from '~backend/shared/typing/utils';

// Authentication
export const UserAuthType = {
	PASSWORD: 'password',
} as const;

export const userAuthTypeSchema = createEnumLikeValuesSchema(UserAuthType);
export type UserAuthType = EnumLikeValues<typeof UserAuthType>;

// Session
export const SessionScope = {
	DEFAULT: 'default',
	YGGDRASIL: 'yggdrasil',
} as const;

export const sessionScopeSchema = createEnumLikeValuesSchema(SessionScope);
export type SessionScope = EnumLikeValues<typeof SessionScope>;

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

// Verification
export const VerificationType = {
	EMAIL: 'email',
} as const;

export const VerificationScenario = {
	SIGNUP: 'signup',
	PASSWORD_RESET: 'password_reset',
} as const;

export const verificationTypeSchema = createEnumLikeValuesSchema(VerificationType);
export const verificationScenarioSchema = createEnumLikeValuesSchema(VerificationScenario);
export type VerificationType = EnumLikeValues<typeof VerificationType>;
export type VerificationScenario = EnumLikeValues<typeof VerificationScenario>;

export const verificationSchema = t.Object({
	id: t.String(),
	userId: t.Nullable(t.String()),
	type: verificationTypeSchema,
	scenario: verificationScenarioSchema,
	target: t.String(),
	secret: t.String(),
	verified: t.Boolean(),
	triesLeft: t.Integer(),
	createdAt: t.Nullable(t.Date()),
	expiresAt: t.Date(),
});

export const verificationDigestSchema = t.Object({
	id: t.String(),
	type: verificationTypeSchema,
	scenario: verificationScenarioSchema,
	target: t.String(),
	verified: t.Boolean(),
});

export type Verification = Static<typeof verificationSchema>;
export type VerificationDigest = Static<typeof verificationDigestSchema>;
