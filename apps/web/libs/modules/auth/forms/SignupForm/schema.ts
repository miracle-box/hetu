import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { ValueErrorType } from '@sinclair/typebox/errors';
import { Compile } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const signupFormSchema = Type.Object({
	email: Type.String({
		format: 'email',
		message: {
			[ValueErrorType.StringFormat]: 'common.validation.emailFormat',
			default: 'common.validation.required',
		},
	}),
	name: Type.String({
		message: 'common.validation.nameRequired',
	}),
	password: Type.String({
		message: 'common.validation.passwordRequired',
	}),
	confirmPassword: Type.String({
		message: 'common.validation.required',
	}),
	verificationId: Type.String({
		message: 'common.validation.required',
	}),
	verificationCode: Type.String({
		minLength: 8,
		maxLength: 8,
		message: 'common.validation.verificationCodeLength',
	}),
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
		onSubmit: Compile(signupFormSchema),
	},
});
