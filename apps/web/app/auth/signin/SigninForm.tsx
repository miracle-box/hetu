'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { mergeForm, useForm, useStore } from '@tanstack/react-form';
import { TypeboxValidator } from '@repo/typebox-form-adapter';
import { useMutation } from '@tanstack/react-query';
import { signinFormOpts, SigninFormValues } from './shared';
import { handleSignin } from './actions';

export function SigninForm() {
	const router = useRouter();

	const submit = useMutation({
		mutationFn: (values: SigninFormValues) => handleSignin(values),
		onSuccess: (data) => {
			if ('formState' in data)
				mergeForm<SigninFormValues, TypeboxValidator>(form, data.formState);

			if ('data' in data) router.push('/');
		},
	});

	const form = useForm({
		...signinFormOpts,
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
