import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { ValueErrorType } from '@sinclair/typebox/errors';
import { Compile } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const signinFormSchema = Type.Object({
	email: Type.String({
		minLength: 1,
		format: 'email',
		message: {
			[ValueErrorType.StringFormat]: 'common.validation.emailFormat',
			default: 'common.validation.required',
		},
	}),
	password: Type.String({
		minLength: 1,
		message: 'common.validation.passwordRequired',
	}),
});
export type SigninFormValues = Static<typeof signinFormSchema>;

export const signinFormOpts = formOptions({
	defaultValues: {
		email: '',
		password: '',
	} as SigninFormValues,
	validators: {
		onSubmit: Compile(signinFormSchema),
	},
});
