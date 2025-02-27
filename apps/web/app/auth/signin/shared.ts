import type { TypeboxValidator } from '@repo/typebox-form-adapter';
import type { Static } from '@sinclair/typebox';
import { typeboxValidator } from '@repo/typebox-form-adapter';
import { Type } from '@sinclair/typebox';
import { formOptions } from '@tanstack/react-form/nextjs';

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
