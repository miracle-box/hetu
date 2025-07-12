import { t, type Static } from 'elysia';
import {
	sessionSchema,
	verificationScenarioSchema,
	VerificationType,
	verificationTypeSchema,
} from '#modules/auth/auth.entities';

export const sessionDigestSchema = t.Omit(sessionSchema, ['token']);

export type SessionDigest = Static<typeof sessionDigestSchema>;

export const baseVerificationDigestSchema = t.Object({
	id: t.String(),
	scenario: verificationScenarioSchema,
	target: t.String(),
	verified: t.Boolean(),
});

const oauth2VerificationDtoSchema = t.Intersect([
	baseVerificationDigestSchema,
	t.Object({
		type: t.Literal(VerificationType.OAUTH2),
		challenge: t.Nullable(t.String()),
	}),
]);

const genericVerificationDtoSchema = t.Intersect([
	baseVerificationDigestSchema,
	t.Object({
		type: t.Exclude(verificationTypeSchema, t.Literal(VerificationType.OAUTH2)),
	}),
]);

export const verificationDtoSchema = t.Union(
	[oauth2VerificationDtoSchema, genericVerificationDtoSchema],
	{
		discriminator: 'type',
	},
);

export type VerificationDto = Static<typeof verificationDtoSchema>;
