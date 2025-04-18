import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { Zod } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const createTextureFormSchema = Type.Object({
	name: Type.String({ minLength: 3, maxLength: 128 }),
	description: Type.String(),
	type: Type.Union([Type.Literal('skin'), Type.Literal('skin_slim'), Type.Literal('cape')]),
	// Parts for constructing a file.
	file: Type.Object({
		name: Type.String({ minLength: 1 }),
		type: Type.String({ minLength: 1 }),
		base64: Type.String({ minLength: 1 }),
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
		onSubmit: Zod(createTextureFormSchema),
	},
});
