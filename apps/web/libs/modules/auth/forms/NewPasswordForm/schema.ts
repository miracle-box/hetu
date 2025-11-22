import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { Compile } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const newPasswordFormSchema = Type.Object({
	password: Type.String({
		message: 'common.validation.passwordRequired',
	}),
	confirmPassword: Type.String({
		message: 'common.validation.required',
	}),
	verificationId: Type.String({
		message: 'common.validation.required',
	}),
});
export type NewPasswordFormValues = Static<typeof newPasswordFormSchema>;

export const newPasswordFormOpts = formOptions({
	defaultValues: {
		password: '',
		confirmPassword: '',
		verificationId: '',
	} as NewPasswordFormValues,
	validators: {
		onSubmit: Compile(newPasswordFormSchema),
	},
});
