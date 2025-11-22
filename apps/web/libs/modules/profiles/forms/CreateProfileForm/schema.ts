import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { ValueErrorType } from '@sinclair/typebox/errors';
import { Compile } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const createProfileFormSchema = Type.Object({
	name: Type.String({
		pattern: '[0-9A-Za-z_]{3,16}',
		message: {
			[ValueErrorType.StringPattern]: 'common.validation.namePattern',
			default: 'common.validation.nameRequired',
		},
	}),
});
export type CreateProfileFormValues = Static<typeof createProfileFormSchema>;

export const createProfileFormOpts = formOptions({
	defaultValues: {
		name: '',
	} as CreateProfileFormValues,
	validators: {
		onSubmit: Compile(createProfileFormSchema),
	},
});
