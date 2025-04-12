'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Input } from '@repo/ui/input';
import React from 'react';
import { passwordResetFormOpts } from './schema';

export const PasswordResetFormView = withForm({
	...passwordResetFormOpts,
	props: {
		formId: 'password-reset-form',
	},
	render: function Render({ form, formId }) {
		return (
			<form.AppForm>
				<form.Form formId={formId} className="flex flex-col gap-4">
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

					<form.Message />
				</form.Form>
			</form.AppForm>
		);
	},
});
