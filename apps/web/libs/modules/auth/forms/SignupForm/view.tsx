'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Button } from '@repo/ui/button';
import { Icon } from '@repo/ui/icon';
import { Input } from '@repo/ui/input';
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
	},
});
