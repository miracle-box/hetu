'use client';

import type { SignupFormValues } from './shared';
import type { TypeboxValidator } from '@repo/typebox-form-adapter';
import { Button } from '@repo/ui/button';
import { Icon } from '@repo/ui/icon';
import { Input } from '@repo/ui/input';
import { mergeForm, useForm, useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { handleSignup } from './actions';
import { signupFormOpts } from './shared';

export function SignupForm() {
	const router = useRouter();

	const submit = useMutation({
		mutationFn: (values: SignupFormValues) => handleSignup(values),
		onSuccess: (data) => {
			if ('formState' in data)
				mergeForm<SignupFormValues, TypeboxValidator>(form, data.formState);

			if ('data' in data) router.push('/');
		},
	});

	const form = useForm({
		...signupFormOpts,
		onSubmit: ({ value }) => submit.mutate(value),
	});
	const formErrors = useStore(form.store, (state) => state.errors);

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<form.Field name="email">
				{(field) => (
					<label className="flex flex-col gap-1">
						<span className="font-medium">Email</span>
						<Input
							name="email"
							type="email"
							placeholder="Email"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors.map((error) => (
							<span key={error as string} className="text-destructive text-sm">
								{error}
							</span>
						))}
					</label>
				)}
			</form.Field>

			<form.Field name="name">
				{(field) => (
					<label className="flex flex-col gap-1">
						<span className="font-medium">Username</span>
						<Input
							name="name"
							type="text"
							placeholder="Username"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors.map((error) => (
							<span key={error as string} className="text-destructive text-sm">
								{error}
							</span>
						))}
					</label>
				)}
			</form.Field>

			<form.Field name="password">
				{(field) => (
					<label className="flex flex-col gap-1">
						<span className="font-medium">Password</span>
						<Input
							name="password"
							type="password"
							placeholder="Password"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors.map((error) => (
							<span key={error as string} className="text-destructive text-sm">
								{error}
							</span>
						))}
					</label>
				)}
			</form.Field>

			<form.Field
				name="confirmPassword"
				validators={{
					onChangeListenTo: ['password'],
					onChange: ({ value, fieldApi }) => {
						if (value !== fieldApi.form.getFieldValue('password'))
							return 'Passwords do not match';

						return undefined;
					},
				}}
			>
				{(field) => (
					<label className="flex flex-col gap-1">
						<span className="font-medium">Confirm password</span>
						<Input
							name="confirmPassword"
							type="password"
							placeholder="Confirm password"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors.map((error) => (
							<span key={error as string} className="text-destructive text-sm">
								{error}
							</span>
						))}
					</label>
				)}
			</form.Field>

			<div>
				{formErrors.map((error) => (
					<span key={error as string} className="text-destructive text-sm">
						{error}
					</span>
				))}
			</div>

			<form.Subscribe selector={(formState) => [formState.canSubmit, formState.isSubmitting]}>
				{([canSubmit, isSubmitting]) => (
					<Button type="submit" className="w-full" disabled={!canSubmit}>
						{isSubmitting ? (
							<>
								<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing up...
							</>
						) : (
							'Sign Up'
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
