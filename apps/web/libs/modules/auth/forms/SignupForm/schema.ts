import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { Zod } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const signupFormSchema = Type.Object({
	email: Type.String(),
	name: Type.String(),
	password: Type.String(),
	confirmPassword: Type.String(),
	verificationId: Type.String(),
	verificationCode: Type.String({ minLength: 8, maxLength: 8 }),
});
export type SignupFormValues = Static<typeof signupFormSchema>;

export const signupFormOpts = formOptions({
	defaultValues: {
		email: '',
		name: '',
		password: '',
		confirmPassword: '',
		verificationId: '',
		verificationCode: '',
	} as SignupFormValues,
	validators: {
		onSubmit: Zod(signupFormSchema),
	},
});
