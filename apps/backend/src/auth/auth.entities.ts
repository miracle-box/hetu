import type { TLiteral } from '@sinclair/typebox';
import type { Static, TSchema } from 'elysia';
import type { EnumLikeValues, Prettify } from '~backend/shared/typing/utils';
import { t } from 'elysia';
import { createEnumLikeValuesSchema } from '~backend/shared/typing/utils';

// Authentication
export const UserAuthType = {
	PASSWORD: 'password',
	OAUTH2: 'oauth2',
} as const;

export const userAuthTypeSchema = createEnumLikeValuesSchema(UserAuthType);
export type UserAuthType = EnumLikeValues<typeof UserAuthType>;

export type BaseAuth = {
	id: string;
	userId: string;
	credential: string;
	createdAt: Date;
	updatedAt: Date;
};

export type PasswordAuth = BaseAuth & {
	type: typeof UserAuthType.PASSWORD;
};

export type OAuthAuth = BaseAuth & {
	type: typeof UserAuthType.OAUTH2;
	provider: string;
	metadata: {
		accessToken: string;
		refreshToken?: string;
		idToken?: string;
		expiresAt?: number;
	};
};

export type AuthMetadata = OAuthAuth['metadata'] | null;

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
		createdAt: t.Date(),
		updatedAt: t.Date(),
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
	OAUTH2: 'oauth2',
} as const;

export const VerificationScenario = {
	SIGNUP: 'signup',
	PASSWORD_RESET: 'password_reset',
	OAUTH2_BIND: 'oauth2_bind',
	OAUTH2_SIGNIN: 'oauth2_signin',
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

export const baseVerificationDigestSchema = t.Object({
	id: t.String(),
	scenario: verificationScenarioSchema,
	target: t.String(),
	verified: t.Boolean(),
});

const oauth2VerificationDigestSchema = t.Intersect([
	baseVerificationDigestSchema,
	t.Object({
		type: t.Literal(VerificationType.OAUTH2),
		challenge: t.Nullable(t.String()),
	}),
]);

const emailVerificationDigestSchema = t.Intersect([
	baseVerificationDigestSchema,
	t.Object({
		type: t.Literal(VerificationType.EMAIL),
	}),
]);

export const verificationDigestSchema = t.Union(
	[oauth2VerificationDigestSchema, emailVerificationDigestSchema],
	{
		discriminator: 'type',
	},
);

export type Verification = Static<typeof verificationSchema>;
export type VerificationDigest = Static<typeof verificationDigestSchema>;

// Session lifecycle management
export const SessionLifecycle = {
	Active: 1,
	Renewable: 2,
	RefreshOnly: 3,
	Expired: 4,
} as const;

export type SessionLifecycle = EnumLikeValues<typeof SessionLifecycle>;
