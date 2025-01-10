'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { initialFormState } from '@tanstack/react-form/nextjs';
import { mergeForm, useForm, useStore, useTransform } from '@tanstack/react-form';
import { TypeboxValidator } from '@repo/typebox-form-adapter';
import { useZustandStore } from '~web/libs/stores/use-zustand-store';
import { useSessionStore } from '~web/libs/stores/session';
import { signupFormOpts, SignupFormValues } from './shared';
import { handleSignup } from './actions';

export function SignupForm() {
	const [state, action] = useActionState(handleSignup, { formState: initialFormState });
	const form = useForm({
		...signupFormOpts,
		transform: useTransform(
			(baseForm) =>
				mergeForm<SignupFormValues, TypeboxValidator>(
					baseForm,
					'formState' in state ? state.formState : {},
				),
			[state],
		),
	});

	const formErrors = useStore(form.store, (state) => state.errors);

	const setSessionStore = useZustandStore(useSessionStore, (state) => state.setSession);
	const session = useZustandStore(useSessionStore, (state) => state.session);

	const router = useRouter();

	useEffect(() => {
		if ('data' in state) {
			// Store session in Zustand store (will persist in localStorage)
			if (setSessionStore) setSessionStore(state.data.session);
			router.push('/');
		}
	}, [state]);

	return (
		<form action={action as never} onSubmit={() => form.handleSubmit()}>
			<Flex gap="3" direction="column">
				<form.Field name="email">
					{(field) => (
						<Box>
							<Text as="label" size="2" weight="bold">
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
						</Box>
					)}
				</form.Field>

				<form.Field name="name">
					{(field) => (
						<Box>
							<Text as="label" size="2" weight="bold">
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
						</Box>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<Box>
							<Text as="label" size="2" weight="bold">
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
						</Box>
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
						<Box>
							<Text as="label" size="2" weight="bold">
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
						</Box>
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
