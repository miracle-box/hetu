import { Static, Type } from '@sinclair/typebox';
import { formOptions } from '@tanstack/react-form/nextjs';
import { typeboxValidator, TypeboxValidator } from '@repo/typebox-form-adapter';

export const signupFormSchema = Type.Object({
	email: Type.String(),
	name: Type.String(),
	password: Type.String(),
	confirmPassword: Type.String(),
});
export type SignupFormValues = Static<typeof signupFormSchema>;

export const signupFormOpts = formOptions<SignupFormValues, TypeboxValidator>({
	defaultValues: {
		email: '',
		name: '',
		password: '',
		confirmPassword: '',
	},
	validatorAdapter: typeboxValidator(),
	validators: {
		onSubmit: signupFormSchema,
	},
});
