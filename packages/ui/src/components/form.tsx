import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { useStore } from '@tanstack/react-form';

import * as React from 'react';

import { useFieldContext, useFormContext } from '#hooks/use-app-form';
import { cn } from '#lib/utils';

const FormIdContext = React.createContext<string | null>(null);

const useFormId = () => {
	const context = React.use(FormIdContext);
	if (!context) {
		throw new Error('useFieldId must be used within an Form.');
	}
	return context;
};

function FormSimpleField({
	children,
	label,
	desc,
}: {
	children: React.ReactNode;
	label: React.ReactNode;
	desc?: React.ReactNode;
}) {
	return (
		<FormFieldItem>
			<FormFieldLabel>{label}</FormFieldLabel>
			<FormFieldControl>{children}</FormFieldControl>
			<FormFieldMessage />
			{!!desc && <FormFieldDesc>{desc}</FormFieldDesc>}
		</FormFieldItem>
	);
}

function FormFieldItem({ className, ...props }: React.ComponentProps<'div'>) {
	return <div className={cn('space-y-2')} {...props} />;
}

function FormFieldLabel({
	className,
	...props
}: React.ComponentPropsWithRef<typeof LabelPrimitive.Root>) {
	const field = useFieldContext<unknown>();
	const formId = useFormId();

	return (
		<label
			className={cn(field.state.meta.errors.length && 'text-destructive', className)}
			htmlFor={`${formId}-${field.name}`}
			{...props}
		/>
	);
}

function FormFieldControl({
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof Slot> & {
	ref?: React.RefObject<React.ComponentRef<typeof Slot> | null>;
}) {
	const field = useFieldContext<unknown>();
	const fieldId = useFormId();

	const hasError = field.state.meta.errors.length > 0;

	return (
		<Slot
			ref={ref}
			id={`${fieldId}-${field.name}`}
			aria-describedby={
				!hasError
					? `${fieldId}-${field.name}-desc`
					: `${fieldId}-${field.name}-desc ${fieldId}-${field.name}-msg`
			}
			aria-invalid={hasError}
			{...props}
		/>
	);
}

function FormFieldDesc({ className, ...props }: React.ComponentPropsWithRef<'p'>) {
	const field = useFieldContext<unknown>();
	const formId = useFormId();

	return (
		<p
			id={`${formId}-${field.name}-desc`}
			className={cn('text-muted-foreground text-[0.8rem]', className)}
			{...props}
		/>
	);
}

function FormFieldMessage({ className, children, ...props }: React.ComponentPropsWithRef<'p'>) {
	const formId = useFormId();
	const field = useFieldContext<unknown>();

	/**
	 * We do not know the type of errors, assume it's from the one returned by TypeBox.
	 */
	const errors = field.state.meta.errors
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		.filter((error) => typeof error === 'object' && typeof error.message === 'string')
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		.map((error) => error.message as string);

	const body = errors.length
		? errors.map((error) => (
				<span key={error} className="block">
					{error}
				</span>
			))
		: children;

	if (!body) return null;

	return (
		<p
			id={`${formId}-${field.name}-msg`}
			className={cn('text-destructive text-[0.8rem]', className)}
			{...props}
		>
			{body}
		</p>
	);
}

function FormMessage({ className, children, ...props }: React.ComponentPropsWithRef<'p'>) {
	const form = useFormContext();
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	const formErrors = useStore(form.store, (state) => state.errors);
	const plainErrors = formErrors.filter((error) => typeof error === 'string');

	const body = plainErrors.length
		? plainErrors.map((error) => (
				<span key={error} className="block">
					{error}
				</span>
			))
		: children;

	if (!body) return null;

	return (
		<p className={cn('text-destructive text-sm', className)} {...props}>
			{body}
		</p>
	);
}

function FormSubmit({
	children,
}: {
	children: (
		canSubmit: boolean | undefined,
		isSubmitting: boolean | undefined,
	) => React.ReactNode;
}) {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(formState) => [formState.canSubmit, formState.isSubmitting]}>
			{([canSubmit, isSubmitting]) => children(canSubmit, isSubmitting)}
		</form.Subscribe>
	);
}

function Form({
	formId,
	children,
	onSubmit,
	...props
}: React.ComponentProps<'form'> & {
	formId?: string;
	children: React.ReactNode;
	onSubmit?: React.FormEventHandler<HTMLFormElement>;
}) {
	const form = useFormContext();
	const formIdContext = React.useId();

	return (
		<FormIdContext value={formId ?? formIdContext}>
			<form
				id={formId ?? formIdContext}
				onSubmit={
					onSubmit ??
					((e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					})
				}
				{...props}
			>
				{children}
			</form>
		</FormIdContext>
	);
}

export {
	FormSimpleField,
	FormFieldItem,
	FormFieldLabel,
	FormFieldControl,
	FormFieldDesc,
	FormFieldMessage,
	FormMessage,
	FormSubmit,
	Form,
};
