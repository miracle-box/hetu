'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Input } from '@repo/ui/input';
import { RequestVerificationButton } from '~web/libs/components/RequestVerificationButton';
import { signupFormOpts } from './schema';

export const SignupFormView = withForm({
	...signupFormOpts,
	props: {
		formId: 'signup-form',
	},
	render: function Render({ form, formId }) {
		return (
			<form.AppForm>
				<form.Form formId={formId} className="flex flex-col gap-4">
					<form.AppField
						name="email"
						children={(field) => (
							<field.Item>
								<field.Label>Email</field.Label>

								<div className="flex w-full items-center gap-2">
									<field.Control>
										<Input
											type="email"
											placeholder="Email"
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
