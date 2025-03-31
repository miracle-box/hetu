import { createFormHookContexts, createFormHook } from '@tanstack/react-form';
import {
	Form,
	FormFieldControl,
	FormFieldDesc,
	FormFieldItem,
	FormFieldLabel,
	FormFieldMessage,
	FormMessage,
	FormSimpleField,
	FormSubmit,
} from '#components/form.tsx';

export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		Item: FormFieldItem,
		Control: FormFieldControl,
		Label: FormFieldLabel,
		Desc: FormFieldDesc,
		Message: FormFieldMessage,
		SimpleField: FormSimpleField,
	},
	formComponents: {
		Message: FormMessage,
		Submit: FormSubmit,
		Form,
	},
});
