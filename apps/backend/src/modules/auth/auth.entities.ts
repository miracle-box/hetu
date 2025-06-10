import type { EnumLikeValues } from '~backend/shared/typing/utils';
import { Type, type Static } from '@sinclair/typebox';
import { createEnumLikeValuesSchema } from '~backend/shared/typing/utils';

// Enums
export const UserAuthType = {
	PASSWORD: 'password',
	OAUTH2: 'oauth2',
} as const;

export const VerificationType = {
	EMAIL: 'email',
	OAUTH2: 'oauth2',
} as const;

export const VerificationScenario = {
	SIGNUP: 'signup',
	PASSWORD_RESET: 'password_reset',
	OAUTH2_BIND: 'oauth2_bind',
	OAUTH2_SIGNIN: 'oauth2_signin',
} as const;

export const SessionScope = {
	DEFAULT: 'default',
	YGGDRASIL: 'yggdrasil',
} as const;

export type UserAuthType = EnumLikeValues<typeof UserAuthType>;
export type VerificationType = EnumLikeValues<typeof VerificationType>;
export type VerificationScenario = EnumLikeValues<typeof VerificationScenario>;
export type SessionScope = EnumLikeValues<typeof SessionScope>;

// Enum Schemas
export const userAuthTypeSchema = createEnumLikeValuesSchema(UserAuthType);
export const verificationTypeSchema = createEnumLikeValuesSchema(VerificationType);
export const verificationScenarioSchema = createEnumLikeValuesSchema(VerificationScenario);
export const sessionScopeSchema = createEnumLikeValuesSchema(SessionScope);

// Auth Metadata Schema
export const authMetadataSchema = Type.Object({
	accessToken: Type.String(),
	refreshToken: Type.Optional(Type.String()),
	idToken: Type.Optional(Type.String()),
	expiresAt: Type.Optional(Type.Number()),
});

// Session Metadata Schema
export const sessionMetadataSchema = Type.Union([
	Type.Object({
		scope: Type.Literal(SessionScope.DEFAULT),
	}),
	Type.Object({
		scope: Type.Literal(SessionScope.YGGDRASIL),
		clientToken: Type.String(),
		selectedProfile: Type.Union([Type.String(), Type.Null()]),
	}),
]);

// User Auth Schema
export const userAuthSchema = Type.Object({
	id: Type.String(),
	userId: Type.String(),
	type: userAuthTypeSchema,
	provider: Type.Optional(Type.String()),
	credential: Type.String(),
	metadata: Type.Optional(authMetadataSchema),
	createdAt: Type.Date(),
	updatedAt: Type.Date(),
});

// Session Schema
export const sessionSchema = Type.Object({
	id: Type.String(),
	token: Type.String(),
	userId: Type.String(),
	metadata: sessionMetadataSchema,
	createdAt: Type.Date(),
	updatedAt: Type.Date(),
});

// Verification Schema
export const verificationSchema = Type.Object({
	id: Type.String(),
	userId: Type.Union([Type.String(), Type.Null()]),
	type: verificationTypeSchema,
	scenario: verificationScenarioSchema,
	target: Type.String(),
	secret: Type.String(),
	verified: Type.Boolean(),
	triesLeft: Type.Integer(),
	expiresAt: Type.Date(),
	createdAt: Type.Union([Type.Date(), Type.Null()]),
});

// OAuth2 Profile Schema
export const oauth2ProfileSchema = Type.Object({
	id: Type.String(),
	email: Type.Optional(Type.String()),
	username: Type.Optional(Type.String()),
	avatarUrl: Type.Optional(Type.String()),
	nickname: Type.Optional(Type.String()),
});

// Static Types
export type AuthMetadata = Static<typeof authMetadataSchema>;
export type SessionMetadata = Static<typeof sessionMetadataSchema>;
export type UserAuth = Static<typeof userAuthSchema>;
export type Session = Static<typeof sessionSchema>;
export type Verification = Static<typeof verificationSchema>;
export type OAuth2Profile = Static<typeof oauth2ProfileSchema>;
