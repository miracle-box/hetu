import type { TypeboxValidator } from '@repo/typebox-form-adapter';
import type { Static } from '@sinclair/typebox';
import { typeboxValidator } from '@repo/typebox-form-adapter';
import { Type } from '@sinclair/typebox';
import { formOptions } from '@tanstack/react-form/nextjs';

export const createTextureFormSchema = Type.Object({
	name: Type.String({ minLength: 3, maxLength: 128 }),
	description: Type.String(),
	type: Type.Union([Type.Literal('skin'), Type.Literal('skin_slim'), Type.Literal('cape')]),
	file: Type.Unknown(),
});
export type CreateTextureFormValues = Static<typeof createTextureFormSchema>;

export const createTextureFormOpts = formOptions<CreateTextureFormValues, TypeboxValidator>({
	defaultValues: {
		name: '',
		description: '',
		type: 'skin',
		file: null,
	},
	validatorAdapter: typeboxValidator(),
	validators: {
		onSubmit: createTextureFormSchema,
	},
});
