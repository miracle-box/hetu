'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Input } from '@repo/ui/input';
import { SegmentedControl, SegmentedControlItem } from '@repo/ui/segmented-control';
import { Textarea } from '@repo/ui/textarea';
import React from 'react';
import { createTextureFormOpts } from './schema';

export const CreateTextureFormView = withForm({
	...createTextureFormOpts,
	props: {
		formId: 'create-texture-form',
	},
	render: function Render({ form, formId }) {
		return (
			<form.AppForm>
				<form.Form formId={formId} className="flex flex-col gap-4">
					<form.AppField
						name="name"
						children={(field) => (
							<field.SimpleField label="Name">
								<Input
									type="text"
									placeholder="Texture Name"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.SimpleField>
						)}
					/>

					<form.AppField
						name="description"
						children={(field) => (
							<field.SimpleField label="Description">
								<Textarea
									placeholder="Texture Description"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.SimpleField>
						)}
					/>

					<form.AppField
						name="file"
						children={(field) => (
							<field.SimpleField label="File">
								<Input
									type="file"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (!file) return;

										void file.bytes().then((fileBytes) => {
											const base64 = fileBytes.toBase64();
											field.handleChange({
												name: file.name,
												type: file.type,
												base64,
											});
										});
									}}
								/>
							</field.SimpleField>
						)}
					/>

					<form.AppField
						name="type"
						children={(field) => (
							<field.SimpleField label="Type" desc="Select the type of texture.">
								<SegmentedControl
									value={field.state.value}
									onValueChange={(value) => {
										field.handleChange(value as 'skin' | 'skin_slim' | 'cape');
									}}
									className="blcok w-full"
								>
									<SegmentedControlItem value="skin">
										Skin (Normal)
									</SegmentedControlItem>
									<SegmentedControlItem value="skin_slim">
										Skin (Slim)
									</SegmentedControlItem>
									<SegmentedControlItem value="cape">Cape</SegmentedControlItem>
								</SegmentedControl>
							</field.SimpleField>
						)}
					/>

					<form.Message />
				</form.Form>
			</form.AppForm>
		);
	},
});
