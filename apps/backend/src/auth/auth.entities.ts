import { createSelectSchema } from 'drizzle-typebox';
import { Static, t } from 'elysia';
import { verificationsTable } from '~/shared/db/schema/verifications';

export enum UserAuthType {
	PASSWORD = 'password',
}

// ====================================================================

const verificationSelectSehema = createSelectSchema(verificationsTable);

export const verificationMetadataSchema = t.Union([
	// Password reset metadata
	t.Object({
		action: t.Literal('password-reset'),
	}),
]);

export const verificationActionSchema = verificationMetadataSchema.properties.action;

// drizzle-typebox can not infer type from jsonb fileds.
export const verificationSchema = t.Composite([
	t.Omit(verificationSelectSehema, ['metadata']),
	t.Object({ metadata: verificationMetadataSchema }),
]);

export const verificationSummarySchema = t.Composite([
	t.Omit(verificationSchema, ['userId', 'secret', 'metadata']),
	t.Object({ action: verificationActionSchema }),
]);

export type VerificationMethod = 'email';
export type VerificationMetadata = Static<typeof verificationMetadataSchema>;
export type VerificationAction = Static<typeof verificationActionSchema>;

export type Verification = Static<typeof verificationSchema>;
export type VerificationSummary = Static<typeof verificationSummarySchema>;
