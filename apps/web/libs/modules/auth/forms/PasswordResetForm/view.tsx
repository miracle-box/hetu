'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Input } from '@repo/ui/input';
import { useTranslations } from 'next-intl';
import React from 'react';
import { passwordResetFormOpts } from './schema';

export const PasswordResetFormView = withForm({
	...passwordResetFormOpts,
	props: {
		formId: 'password-reset-form',
	},
	render: function Render({ form, formId }) {
		const t = useTranslations();

		return (
			<form.AppForm>
				<form.Form formId={formId} className="flex flex-col gap-4">
					<form.AppField
						name="email"
						children={(field) => (
							<field.SimpleField label={t('common.labels.email')}>
								<Input
									type="email"
									placeholder={t('common.placeholders.email')}
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
