import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { ValueErrorType } from '@sinclair/typebox/errors';
import { Compile } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const createTextureFormSchema = Type.Object({
	name: Type.String({
		minLength: 3,
		maxLength: 128,
		message: {
			[ValueErrorType.StringMinLength]: 'common.validation.minLength',
			[ValueErrorType.StringMaxLength]: 'common.validation.maxLength',
			default: 'common.validation.nameRequired',
		},
	}),
	description: Type.String({
		message: 'common.validation.descriptionRequired',
	}),
	type: Type.Union([Type.Literal('skin'), Type.Literal('skin_slim'), Type.Literal('cape')], {
		message: 'common.validation.typeRequired',
	}),
	// Parts for constructing a file.
	file: Type.Object({
		name: Type.String({
			minLength: 1,
			message: 'common.validation.fileRequired',
		}),
		type: Type.String({
			minLength: 1,
			message: 'common.validation.fileRequired',
		}),
		base64: Type.String({
			minLength: 1,
			message: 'common.validation.fileRequired',
		}),
	}),
});
export type CreateTextureFormValues = Static<typeof createTextureFormSchema>;

export const createTextureFormOpts = formOptions({
	defaultValues: {
		name: '',
		description: '',
		type: 'skin',
		file: {
			name: '',
			type: '',
			base64: '',
		},
	} as CreateTextureFormValues,
	validators: {
		onSubmit: Compile(createTextureFormSchema),
	},
});
