'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Input } from '@repo/ui/input';
import { useTranslations } from 'next-intl';
import React from 'react';
import { newPasswordFormOpts } from './schema';

export const NewPasswordFormView = withForm({
	...newPasswordFormOpts,
	props: {
		formId: 'new-password-form',
	},
	render: function Render({ form, formId }) {
		const t = useTranslations();

		return (
			<form.AppForm>
				<form.Form formId={formId} className="flex w-full flex-col justify-start gap-4">
					{/* Password Field */}
					<form.AppField
						name="password"
						children={(field) => (
							<field.SimpleField label={t('common.labels.password')}>
								<Input
									type="password"
									placeholder={t('common.placeholders.password')}
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
									return t('auth.passwordReset.form.passwordMismatch');
								}
								return undefined;
							},
						}}
						children={(field) => (
							<field.SimpleField label={t('common.labels.confirmPassword')}>
								<Input
									type="password"
									placeholder={t('common.placeholders.confirmPassword')}
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
