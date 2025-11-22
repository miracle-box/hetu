'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Input } from '@repo/ui/input';
import { useTranslations } from 'next-intl';
import { RequestVerificationButton } from '~web/libs/components/RequestVerificationButton';
import { signupFormOpts } from './schema';

export const SignupFormView = withForm({
	...signupFormOpts,
	props: {
		formId: 'signup-form',
	},
	render: function Render({ form, formId }) {
		const t = useTranslations();

		return (
			<form.AppForm>
				<form.Form formId={formId} className="flex flex-col gap-4">
					<form.AppField
						name="email"
						children={(field) => (
							<field.Item>
								<field.Label>{t('common.labels.email')}</field.Label>

								<div className="flex w-full items-center gap-2">
									<field.Control>
										<Input
											type="email"
											placeholder={t('common.placeholders.email')}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</field.Control>
									<RequestVerificationButton
										type="email"
										scenario="signup"
										getTarget={() => form.getFieldValue('email')}
										onVerificationRequested={(id) => {
											form.setFieldValue('verificationId', id);
										}}
										onError={(message) => {
											field.setMeta((meta) => ({
												...meta,
												errorMap: {
													onServer: [{ message }],
												},
											}));
										}}
									/>
								</div>
								<field.Message />
							</field.Item>
						)}
					/>

					<form.AppField
						name="verificationCode"
						children={(field) => (
							<field.SimpleField label={t('auth.signup.form.verificationCode.label')}>
								<Input
									type="number"
									placeholder={t('common.placeholders.verificationCode')}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.SimpleField>
						)}
					/>

					<form.AppField
						name="name"
						children={(field) => (
							<field.SimpleField label={t('common.labels.username')}>
								<Input
									type="text"
									placeholder={t('common.placeholders.username')}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.SimpleField>
						)}
					/>

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

					<form.AppField
						name="confirmPassword"
						validators={{
							onChangeListenTo: ['password'],
							onChange: ({ value, fieldApi }) => {
								if (value !== fieldApi.form.getFieldValue('password')) {
									return t('auth.signup.form.passwordMismatch');
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
