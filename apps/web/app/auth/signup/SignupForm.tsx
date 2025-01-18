'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { mergeForm, useForm, useStore } from '@tanstack/react-form';
import { TypeboxValidator } from '@repo/typebox-form-adapter';
import { useMutation } from '@tanstack/react-query';
import { signupFormOpts, SignupFormValues } from './shared';
import { handleSignup } from './actions';

export function SignupForm() {
	const router = useRouter();

	const submit = useMutation({
		mutationFn: (values: SignupFormValues) => handleSignup(values),
		onSuccess: (data) => {
			if ('formState' in data)
				mergeForm<SignupFormValues, TypeboxValidator>(form, data.formState);

			if ('data' in data) router.push('/');
		},
	});

	const form = useForm({
		...signupFormOpts,
		onSubmit: async ({ value }) => submit.mutate(value),
	});
	const formErrors = useStore(form.store, (state) => state.errors);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<Flex gap="3" direction="column">
				<form.Field name="email">
					{(field) => (
						<label>
							<Text size="2" weight="bold">
								Email
							</Text>
							<TextField.Root
								name="email"
								placeholder="Email"
								type="email"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<Text key={error as string} color="red" size="2">
									{error}
								</Text>
							))}
						</label>
					)}
				</form.Field>

				<form.Field name="name">
					{(field) => (
						<label>
							<Text size="2" weight="bold">
								Username
							</Text>
							<TextField.Root
								name="name"
								placeholder="Username"
								type="text"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<Text key={error as string} color="red" size="2">
									{error}
								</Text>
							))}
						</label>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<label>
							<Text size="2" weight="bold">
								Password
							</Text>
							<TextField.Root
								name="password"
								placeholder="Password"
								type="password"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<Text key={error as string} color="red" size="2">
									{error}
								</Text>
							))}
						</label>
					)}
				</form.Field>

				<form.Field
					name="confirmPassword"
					validators={{
						onChangeListenTo: ['password'],
						onChange: ({ value, fieldApi }) => {
							if (value !== fieldApi.form.getFieldValue('password'))
								return 'Passwords do not match';

							return undefined;
						},
					}}
				>
					{(field) => (
						<label>
							<Text size="2" weight="bold">
								Confirm password
							</Text>
							<TextField.Root
								name="confirmPassword"
								placeholder="Confirm password"
								type="password"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<Text key={error as string} color="red" size="2">
									{error}
								</Text>
							))}
						</label>
					)}
				</form.Field>

				<Box>
					{formErrors.map((error) => (
						<Text key={error as string} color="red" size="2">
							{error}
						</Text>
					))}
				</Box>

				<form.Subscribe
					selector={(formState) => [formState.canSubmit, formState.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
							Sign Up
						</Button>
					)}
				</form.Subscribe>
			</Flex>
		</form>
	);
}
