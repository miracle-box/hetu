import { formOptions } from '@tanstack/react-form/nextjs';
import { Type, Static } from '@sinclair/typebox';
import { typeboxValidator, TypeboxValidator } from '@repo/typebox-form-adapter';

export const signinFormSchema = Type.Object({
	email: Type.String(),
	password: Type.String(),
});
export type SigninFormValues = Static<typeof signinFormSchema>;

export const signinFormOpts = formOptions<SigninFormValues, TypeboxValidator>({
	defaultValues: {
		email: '',
		password: '',
	},
	validatorAdapter: typeboxValidator(),
	validators: {
		onSubmit: signinFormSchema,
	},
});
