import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { Zod } from '@sinclair/typemap';
import { formOptions } from '@tanstack/react-form/nextjs';

export const signinFormSchema = Type.Object({
	email: Type.String({ minLength: 1, format: 'email' }),
	password: Type.String({ minLength: 1 }),
});
export type SigninFormValues = Static<typeof signinFormSchema>;

export const signinFormOpts = formOptions({
	defaultValues: {
		email: '',
		password: '',
	} as SigninFormValues,
	validators: {
		// [FIXME] Schema compiled by TypeMap does not work with TanStack Form for now. **THIS LINE APPLIES TO ALL FORM VALIDATORS**
		onSubmit: Zod(signinFormSchema),
	},
});
