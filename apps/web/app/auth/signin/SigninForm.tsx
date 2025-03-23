'use client';

import type { SigninFormValues } from './shared';
import type { TypeboxValidator } from '@repo/typebox-form-adapter';
import { Button } from '@repo/ui/button';
import { Icon } from '@repo/ui/icon';
import { Input } from '@repo/ui/input';
import { mergeForm, useForm, useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { handleSignin } from './actions';
import { signinFormOpts } from './shared';

export function SigninForm() {
	const router = useRouter();

	const submit = useMutation({
		mutationFn: (values: SigninFormValues) => handleSignin(values),
		onSuccess: (data) => {
			if ('formState' in data)
				mergeForm<SigninFormValues, TypeboxValidator>(form, data.formState);

			if ('data' in data) router.push('/');
		},
	});

	const form = useForm({
		...signinFormOpts,
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
								Signing in...
							</>
						) : (
							'Sign In'
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
