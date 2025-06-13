import { t, type Static } from 'elysia';
import {
	verificationScenarioSchema,
	VerificationType,
	verificationTypeSchema,
} from '../auth.entities';

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
