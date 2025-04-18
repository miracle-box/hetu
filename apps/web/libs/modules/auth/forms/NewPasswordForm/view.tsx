'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Input } from '@repo/ui/input';
import React from 'react';
import { newPasswordFormOpts } from './schema';

export const NewPasswordFormView = withForm({
	...newPasswordFormOpts,
	props: {
		formId: 'new-password-form',
	},
	render: function Render({ form, formId }) {
		return (
			<form.AppForm>
				<form.Form formId={formId} className="flex w-full flex-col justify-start gap-4">
					{/* Password Field */}
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

					{/* Confirm Password Field */}
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
				</form.Form>
			</form.AppForm>
		);
	},
});
