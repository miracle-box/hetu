import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { Zod } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const signupFormSchema = Type.Object({
	email: Type.String(),
	name: Type.String(),
	password: Type.String(),
	confirmPassword: Type.String(),
});
export type SignupFormValues = Static<typeof signupFormSchema>;

export const signupFormOpts = formOptions({
	defaultValues: {
		email: '',
		name: '',
		password: '',
		confirmPassword: '',
	} as SignupFormValues,
	validators: {
		onSubmit: Zod(signupFormSchema),
	},
});
