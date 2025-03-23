import type { TypeboxValidator } from '@repo/typebox-form-adapter';
import type { Static } from '@sinclair/typebox';
import type { ReactFormExtendedApi } from '@tanstack/react-form';
import { typeboxValidator } from '@repo/typebox-form-adapter';
import { Type } from '@sinclair/typebox';
import { formOptions } from '@tanstack/react-form/nextjs';

export const createProfileFormSchema = Type.Object({
	name: Type.String({ pattern: '[0-9A-Za-z_]{3,16}' }),
});

export const createProfileFormOpts = formOptions<CreateProfileFormValues, TypeboxValidator>({
	defaultValues: {
		name: '',
	},
	validatorAdapter: typeboxValidator(),
	validators: {
		onSubmit: createProfileFormSchema,
	},
});

export type CreateProfileFormValues = Static<typeof createProfileFormSchema>;
export type CreateProfileFormApi = ReactFormExtendedApi<CreateProfileFormValues, TypeboxValidator>;
