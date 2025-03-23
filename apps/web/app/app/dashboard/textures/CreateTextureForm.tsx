import type { CreateTextureFormApi } from './shared';
import { Input } from '@repo/ui/input';
import { SegmentedControl, SegmentedControlItem } from '@repo/ui/segmented-control';
import { Textarea } from '@repo/ui/textarea';
import { useStore } from '@tanstack/react-form';
import React from 'react';

type Props = {
	form: CreateTextureFormApi;
};

export function CreateTextureForm({ form }: Props) {
	const formErrors = useStore(form.store, (state) => state.errors);

	return (
		<form
			className="flex flex-col gap-2"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<form.Field name="name">
				{(field) => (
					<label>
						<span>Name</span>
						<Input
							name="name"
							type="text"
							placeholder="Name"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors.map((error) => (
							<span key={error as string} className="text-destructive">
								{error}
							</span>
						))}
					</label>
				)}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<label>
						<span>Description</span>
						<Textarea
							name="description"
							placeholder="Description"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors.map((error) => (
							<span key={error as string} className="text-destructive">
								{error}
							</span>
						))}
					</label>
				)}
			</form.Field>

			<form.Field name="type">
				{(field) => (
					<div>
						<div className="flex flex-col gap-2">
							<span>Type</span>
							<SegmentedControl
								// defaultValue="skin"
								value={field.state.value}
								onValueChange={(value) => {
									field.handleChange(value as 'skin' | 'skin_slim' | 'cape');
								}}
							>
								<SegmentedControlItem value="skin">
									Skin (Normal)
								</SegmentedControlItem>
								<SegmentedControlItem value="skin_slim">
									Skin (Slim)
								</SegmentedControlItem>
								<SegmentedControlItem value="cape">Cape</SegmentedControlItem>
							</SegmentedControl>
						</div>

						{field.state.meta.errors.map((error) => (
							<span key={error as string} className="text-destructive">
								{error}
							</span>
						))}
					</div>
				)}
			</form.Field>

			<form.Field name="file">
				{(field) => (
					<label>
						<span>File</span>
						<Input
							name="file"
							type="file"
							placeholder="Select File"
							accept="image/png"
							onChange={(e) => {
								const selectedFile = e.target.files?.[0];
								if (selectedFile) field.handleChange(selectedFile);
								else e.target.value = '';
							}}
						/>
						{field.state.meta.errors.map((error) => (
							<span key={error as string} className="text-destructive">
								{error}
							</span>
						))}
					</label>
				)}
			</form.Field>

			<div>
				{formErrors.map((error) => (
					<span key={error as string} className="text-destructive">
						{error}
					</span>
				))}
			</div>
		</form>
	);
}
