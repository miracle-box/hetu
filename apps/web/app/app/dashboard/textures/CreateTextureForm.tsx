'use client';

import {
	Box,
	Button,
	Dialog,
	Flex,
	SegmentedControl,
	Text,
	TextArea,
	TextField,
} from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { mergeForm, useForm, useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { TypeboxValidator } from '@repo/typebox-form-adapter';
import { createTextureFormOpts, CreateTextureFormValues } from './shared';
import { handleCreateTexture } from './actions';
import { Input } from '@repo/ui/Input';

export function CreateTextureForm() {
	const router = useRouter();

	const submit = useMutation({
		mutationFn: (values: CreateTextureFormValues) => handleCreateTexture(values),
		onSuccess: (data) => {
			if ('formState' in data)
				mergeForm<CreateTextureFormValues, TypeboxValidator>(form, data.formState);

			if ('data' in data) {
				router.push(`/app/dashboard/textures/${data.data.id}`);
			}
		},
	});

	const form = useForm({
		...createTextureFormOpts,
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

				<form.Field name="description">
					{(field) => (
						<label>
							<Text size="2" weight="bold">
								Description
							</Text>
							<TextArea
								name="description"
								placeholder="Description"
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

				<form.Field name="type">
					{(field) => (
						<label>
							<Flex direction="column" gap="1">
								<Text size="2" weight="bold">
									Type
								</Text>
								<SegmentedControl.Root
									defaultValue="skin"
									value={field.state.value}
									onValueChange={(value) =>
										field.handleChange(value as 'skin' | 'skin_slim' | 'cape')
									}
								>
									<SegmentedControl.Item value="skin">
										Skin (Normal)
									</SegmentedControl.Item>
									<SegmentedControl.Item value="skin_slim">
										Skin (Slim)
									</SegmentedControl.Item>
									<SegmentedControl.Item value="cape">Cape</SegmentedControl.Item>
								</SegmentedControl.Root>
							</Flex>
							{field.state.meta.errors.map((error) => (
								<Text key={error as string} color="red" size="2">
									{error}
								</Text>
							))}
						</label>
					)}
				</form.Field>

				<form.Field name="file">
					{(field) => (
						<label>
							<Text size="2" weight="bold">
								File
							</Text>
							<Input
								name="file"
								type="file"
								placeholder="Select File"
								accept="image/png"
								onChange={async (e) => {
									const selectedFile = e.target.files?.[0];
									if (selectedFile) field.handleChange(selectedFile);
									else e.target.value = '';
								}}
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
								Create texture
							</Button>
						</Flex>
					)}
				</form.Subscribe>
			</Flex>
		</form>
	);
}
