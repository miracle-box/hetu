import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { Zod } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const newPasswordFormSchema = Type.Object({
	password: Type.String(),
	confirmPassword: Type.String(),
	verificationId: Type.String(),
});
export type NewPasswordFormValues = Static<typeof newPasswordFormSchema>;

export const newPasswordFormOpts = formOptions({
	defaultValues: {
		password: '',
		confirmPassword: '',
		verificationId: '',
	} as NewPasswordFormValues,
	validators: {
		onSubmit: Zod(newPasswordFormSchema),
	},
});
