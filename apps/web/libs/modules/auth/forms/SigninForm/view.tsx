'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Input } from '@repo/ui/input';
import { signinFormOpts } from './schema';

export const SigninFormView = withForm({
	...signinFormOpts,
	props: {
		formId: 'signin-form',
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

					<form.AppField
						name="password"
						children={(field) => (
							<field.SimpleField label="Password">
								<Input
									type="password"
									placeholder="Password"
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
