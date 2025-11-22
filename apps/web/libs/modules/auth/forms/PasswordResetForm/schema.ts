import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { ValueErrorType } from '@sinclair/typebox/errors';
import { Compile } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form-nextjs';

export const passwordResetFormSchema = Type.Object({
	email: Type.String({
		minLength: 1,
		format: 'email',
		message: {
			[ValueErrorType.StringFormat]: 'common.validation.emailFormat',
			default: 'common.validation.required',
		},
	}),
});
export type PasswordResetFormValues = Static<typeof passwordResetFormSchema>;

export const passwordResetFormOpts = formOptions({
	defaultValues: {
		email: '',
	} as PasswordResetFormValues,
	validators: {
		onSubmit: Compile(passwordResetFormSchema),
	},
});
