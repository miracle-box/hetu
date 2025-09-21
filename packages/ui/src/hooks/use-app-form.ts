import {
	createFormHookContexts,
	createFormHook,
	type FormOptions,
	type FormAsyncValidateOrFn,
	type FormValidateOrFn,
} from '@tanstack/react-form';
import React from 'react';
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

export const { useAppForm: appFormHook, withForm } = createFormHook({
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

export function createAppFormHook<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TFormView extends (props: any) => React.JSX.Element,
	// Type params required by FormOptions
	TFormData,
	TOnMount extends undefined | FormValidateOrFn<TFormData>,
	TOnChange extends undefined | FormValidateOrFn<TFormData>,
	TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
	TOnBlur extends undefined | FormValidateOrFn<TFormData>,
	TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
	TOnSubmit extends undefined | FormValidateOrFn<TFormData>,
	TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
	TOnDynamic extends undefined | FormValidateOrFn<TFormData>,
	TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
	TOnServer extends undefined | FormAsyncValidateOrFn<TFormData>,
	TSubmitMeta,
>(
	predefinedFormOptions: Partial<
		FormOptions<
			TFormData,
			TOnMount,
			TOnChange,
			TOnChangeAsync,
			TOnBlur,
			TOnBlurAsync,
			TOnSubmit,
			TOnSubmitAsync,
			TOnDynamic,
			TOnDynamicAsync,
			TOnServer,
			TSubmitMeta
		>
	>,
	FormView: TFormView,
) {
	return (
		formOptions: FormOptions<
			TFormData,
			TOnMount,
			TOnChange,
			TOnChangeAsync,
			TOnBlur,
			TOnBlurAsync,
			TOnSubmit,
			TOnSubmitAsync,
			TOnDynamic,
			TOnDynamicAsync,
			TOnServer,
			TSubmitMeta
		>,
	) => {
		const form = appFormHook({ ...predefinedFormOptions, ...formOptions });
		const formId = React.useId();

		return {
			form,
			formId,
			// Pre-defined form instance and formId for better DX.
			FormView: (props: Omit<Parameters<TFormView>[0], 'form' | 'formId'>) => {
				return FormView({
					...props,
					form,
					formId,
				});
			},
		};
	};
}
