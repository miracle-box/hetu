'use client';

import { useActionState, useEffect } from 'react';
import { Box, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { mergeForm, useForm, useStore, useTransform } from '@tanstack/react-form';
import { initialFormState } from '@tanstack/react-form/nextjs';
import { TypeboxValidator } from '@repo/typebox-form-adapter';
import { useZustandStore } from '~web/libs/stores/use-zustand-store';
import { useSessionStore } from '~web/libs/stores/session';
import { signinFormOpts, SigninFormValues } from './shared';
import { handleSignin } from './actions';

export function SigninForm() {
	const [state, action] = useActionState(handleSignin, { formState: initialFormState });
	const form = useForm({
		...signinFormOpts,
		transform: useTransform(
			(baseFrom) =>
				mergeForm<SigninFormValues, TypeboxValidator>(
					baseFrom,
					'formState' in state ? state.formState : {},
				),
			[state],
		),
	});
	const formErrors = useStore(form.store, (state) => state.errors);

	const setSessionStore = useZustandStore(useSessionStore, (state) => state.setSession);
	const session = useZustandStore(useSessionStore, (state) => state.session);

	useEffect(() => {
		if ('data' in state) {
			// Store session in Zustand store (will persist in localStorage)
			if (setSessionStore) setSessionStore(state.data.session);
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
							Sign In
						</Button>
					)}
				</form.Subscribe>
			</Flex>
		</form>
	);
}
