'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Input } from '@repo/ui/input';
import { useTranslations } from 'next-intl';
import React from 'react';
import { createProfileFormOpts } from './schema';

export const CreateProfileFormView = withForm({
	...createProfileFormOpts,
	props: {
		formId: 'create-profile-form',
	},
	render: function Render({ form, formId }) {
		const t = useTranslations();

		return (
			<form.AppForm>
				<form.Form formId={formId} className="flex flex-col gap-4">
					<form.AppField
						name="name"
						children={(field) => (
							<field.SimpleField
								label={t('dashboard.profiles.form.name.label')}
								desc={t('dashboard.profiles.form.name.description')}
							>
								<Input
									type="text"
									placeholder={t('dashboard.profiles.form.name.placeholder')}
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
