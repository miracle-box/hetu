import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { Zod } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const passwordResetFormSchema = Type.Object({
	email: Type.String({ minLength: 1, format: 'email' }),
});
export type PasswordResetFormValues = Static<typeof passwordResetFormSchema>;

export const passwordResetFormOpts = formOptions({
	defaultValues: {
		email: '',
	} as PasswordResetFormValues,
	validators: {
		onSubmit: Zod(passwordResetFormSchema),
	},
});
