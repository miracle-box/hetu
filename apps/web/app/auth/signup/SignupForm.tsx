'use client';

import { Button } from '@repo/ui/button';
import { useAppForm } from '@repo/ui/hooks/use-app-form';
import { Icon } from '@repo/ui/icon';
import { Input } from '@repo/ui/input';
import { mergeForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { handleSignup } from './actions';
import { signupFormOpts, type SignupFormValues } from './shared';

export function SignupForm() {
	const router = useRouter();

	const request = useMutation({
		mutationFn: (values: SignupFormValues) => handleSignup(values),
		onSuccess: (data) => {
			if ('formState' in data) mergeForm<SignupFormValues>(form, data.formState);

			if ('data' in data) router.push('/');
		},
	});

	const form = useAppForm({
		...signupFormOpts,
		onSubmit: ({ value }) => request.mutate(value),
	});

	return (
		<form.AppForm>
			<form.Form className="flex flex-col gap-4">
				<form.AppField
					name="email"
					children={(field) => (
						<field.SimpleField label="Email">
							<Input
								type="email"
								placeholder="Email"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</field.SimpleField>
					)}
				/>

				<form.AppField
					name="name"
					children={(field) => (
						<field.SimpleField label="Username">
							<Input
								type="text"
								placeholder="Username"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</field.SimpleField>
					)}
				/>

				<form.AppField
					name="password"
					children={(field) => (
						<field.SimpleField label="Password">
							<Input
								type="password"
								placeholder="Password"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</field.SimpleField>
					)}
				/>

				<form.Message />

				<form.Submit>
					{(canSubmit, isSubmitting) => (
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
				</form.Submit>
			</form.Form>
		</form.AppForm>
	);
}
