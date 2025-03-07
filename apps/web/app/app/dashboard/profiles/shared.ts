import type { TypeboxValidator } from '@repo/typebox-form-adapter';
import type { Static } from '@sinclair/typebox';
import { typeboxValidator } from '@repo/typebox-form-adapter';
import { Type } from '@sinclair/typebox';
import { formOptions } from '@tanstack/react-form/nextjs';

export const createProfileFormSchema = Type.Object({
	name: Type.String({ pattern: '[0-9A-Za-z_]{3,16}' }),
});
export type CreateProfileFormValues = Static<typeof createProfileFormSchema>;

export const createProfileFormOpts = formOptions<CreateProfileFormValues, TypeboxValidator>({
	defaultValues: {
		name: '',
	},
	validatorAdapter: typeboxValidator(),
	validators: {
		onSubmit: createProfileFormSchema,
	},
});
