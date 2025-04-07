'use client';

import { Button } from '@repo/ui/button';
import { useAppForm } from '@repo/ui/hooks/use-app-form';
import { useCountdown } from '@repo/ui/hooks/use-countdown';
import { Icon } from '@repo/ui/icon';
import { Input } from '@repo/ui/input';
import { mergeForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
	handleRequestEmailVerification,
	handleSignup,
	handleVerifyEmailVerification,
} from './actions';
import { signupFormOpts, type SignupFormValues } from './shared';

export function SignupForm() {
	const router = useRouter();
	const { countdown, setCountdown } = useCountdown(0);

	const signupMutation = useMutation({
		mutationFn: handleSignup,
		onSuccess: (data) => {
			if ('formState' in data) mergeForm<SignupFormValues>(form, data.formState);
			if ('data' in data) router.push('/');
		},
	});

	const verifRequestMutation = useMutation({
		mutationFn: handleRequestEmailVerification,
		onSuccess: (data) => {
			if ('formState' in data) {
				mergeForm<SignupFormValues>(form, data.formState);
			}
			if ('data' in data) {
				setCountdown(60);
				form.setFieldValue('verificationId', data.data.verification.id);
			}
		},
	});

	const verifVerifyMutation = useMutation({
		mutationFn: (values: SignupFormValues) =>
			handleVerifyEmailVerification(values.verificationId, values.verificationCode),
	});

	const form = useAppForm({
		...signupFormOpts,
		onSubmit: async ({ value }) => {
			await verifVerifyMutation.mutateAsync(value);
			await signupMutation.mutateAsync(value);
		},
	});

	const handleSendCode = () => {
		const email = form.getFieldValue('email');
		if (email) {
			verifRequestMutation.mutate(email);
		}
	};

	return (
		<form.AppForm>
			<form.Form className="flex flex-col gap-4">
				{/* Email Field with Verification Button */}
				<form.AppField
					name="email"
					children={(field) => (
						<field.SimpleField label="Email">
							<div className="flex w-full items-center gap-2">
								<Input
									type="email"
									placeholder="Email"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								<Button
									onClick={handleSendCode}
									disabled={
										!field.state.value ||
										verifRequestMutation.isPending ||
										countdown > 0
									}
								>
									{verifRequestMutation.isPending ? (
										<>
											<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Sending...
										</>
									) : countdown > 0 ? (
										`Resend (${countdown}s)`
									) : (
										'Send Code'
									)}
								</Button>
							</div>
						</field.SimpleField>
					)}
				/>

				{/* Verification Code */}
				<form.AppField
					name="verificationCode"
					children={(field) => (
						<field.SimpleField label="Verification Code">
							<Input
								type="number"
								placeholder="Enter verification code"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</field.SimpleField>
					)}
				/>

				{/* Username */}
				<form.AppField
					name="name"
					children={(field) => (
						<field.SimpleField label="Username">
							<Input
								type="text"
								placeholder="Choose a username"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</field.SimpleField>
					)}
				/>

				{/* Password */}
				<form.AppField
					name="password"
					children={(field) => (
						<field.SimpleField label="Password">
							<Input
								type="password"
								placeholder="Create password"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</field.SimpleField>
					)}
				/>

				{/* Confirm Password */}
				<form.AppField
					name="confirmPassword"
					validators={{
						onChangeListenTo: ['password'],
						onChange: ({ value, fieldApi }) => {
							if (value !== fieldApi.form.getFieldValue('password')) {
								return 'Passwords do not match';
							}
							return undefined;
						},
					}}
					children={(field) => (
						<field.SimpleField label="Confirm Password">
							<Input
								type="password"
								placeholder="Confirm your password"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</field.SimpleField>
					)}
				/>

				<form.Message />

				<form.Submit>
					{(canSubmit, isSubmitting) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!canSubmit}
							aria-busy={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating Account...
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
