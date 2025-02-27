'use client';

import type { CreateProfileFormValues } from './shared';
import type { TypeboxValidator } from '@repo/typebox-form-adapter';
import { Box, Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { mergeForm, useForm, useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { handleCreateProfile } from './actions';
import { createProfileFormOpts } from './shared';

export function CreateProfileForm() {
	const router = useRouter();

	const submit = useMutation({
		mutationFn: (values: CreateProfileFormValues) => handleCreateProfile(values),
		onSuccess: (data) => {
			if ('formState' in data)
				mergeForm<CreateProfileFormValues, TypeboxValidator>(form, data.formState);

			if ('data' in data) {
				router.push(`/app/dashboard/profiles/${data.data.id}`);
			}
		},
	});

	const form = useForm({
		...createProfileFormOpts,
		onSubmit: ({ value }) => submit.mutate(value),
	});
	const formErrors = useStore(form.store, (state) => state.errors);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<Flex gap="3" direction="column">
				<form.Field name="name">
					{(field) => (
						<label>
							<Text size="2" weight="bold">
								Name
							</Text>
							<TextField.Root
								name="name"
								placeholder="Name"
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
						<Flex justify="end" mt="3" gap="3">
							<Dialog.Close>
								<Button variant="soft" color="gray">
									Cancel
								</Button>
							</Dialog.Close>
							<Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
								Create profile
							</Button>
						</Flex>
					)}
				</form.Subscribe>
			</Flex>
		</form>
	);
}
