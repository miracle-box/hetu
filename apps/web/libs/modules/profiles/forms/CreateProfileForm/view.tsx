'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Input } from '@repo/ui/input';
import React from 'react';
import { createProfileFormOpts } from './schema';

export const CreateProfileFormView = withForm({
	...createProfileFormOpts,
	props: {
		formId: 'create-profile-form',
	},
	render: function Render({ form, formId }) {
		return (
			<form.AppForm>
				<form.Form formId={formId} className="flex flex-col gap-4">
					<form.AppField
						name="name"
						children={(field) => (
							<field.SimpleField
								label="Name"
								desc="Player name should be 3-16 characters long. Numbers, letters, and underscores are allowed."
							>
								<Input
									type="text"
									placeholder="Name"
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
