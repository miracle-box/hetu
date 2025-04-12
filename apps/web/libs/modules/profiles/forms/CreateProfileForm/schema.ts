import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { Zod } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const createProfileFormSchema = Type.Object({
	name: Type.String({ pattern: '[0-9A-Za-z_]{3,16}' }),
});
export type CreateProfileFormValues = Static<typeof createProfileFormSchema>;

export const createProfileFormOpts = formOptions({
	defaultValues: {
		name: '',
	} as CreateProfileFormValues,
	validators: {
		onSubmit: Zod(createProfileFormSchema),
	},
});
