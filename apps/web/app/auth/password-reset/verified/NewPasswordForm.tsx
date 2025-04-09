'use client';

import { Button } from '@repo/ui/button';
import { useAppForm } from '@repo/ui/hooks/use-app-form';
import { Icon } from '@repo/ui/icon';
import { Input } from '@repo/ui/input';
import { mergeForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React from 'react';
import { handleResetPassword } from './actions';
import { newPasswordFormOpts, type NewPasswordFormValues } from './shared';

export function NewPasswordForm({ verificationId }: { verificationId: string }) {
	const router = useRouter();

	const resetPasswordMutation = useMutation({
		mutationFn: (values: NewPasswordFormValues) => handleResetPassword(values),
		onSuccess: (data) => {
			if ('formState' in data) mergeForm<NewPasswordFormValues>(form, data.formState);
			if ('data' in data) router.push('/');
		},
	});

	const form = useAppForm({
		...newPasswordFormOpts,
		onSubmit: ({ value }) => resetPasswordMutation.mutate(value),
	});

	React.useEffect(() => {
		form.setFieldValue('verificationId', verificationId);
	}, [verificationId, form]);

	return (
		<form.AppForm>
			<form.Form className="flex w-full flex-col justify-start gap-4">
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
									Submitting...
								</>
							) : (
								'Change Password'
							)}
						</Button>
					)}
				</form.Submit>
			</form.Form>
		</form.AppForm>
	);
}
