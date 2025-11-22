'use client';

import { withForm } from '@repo/ui/hooks/use-app-form';
import { Input } from '@repo/ui/input';
import { SegmentedControl, SegmentedControlItem } from '@repo/ui/segmented-control';
import { Textarea } from '@repo/ui/textarea';
import { useTranslations } from 'next-intl';
import React from 'react';
import { fileToBase64 } from '~web/libs/utils/file';
import { createTextureFormOpts } from './schema';

export const CreateTextureFormView = withForm({
	...createTextureFormOpts,
	props: {
		formId: 'create-texture-form',
	},
	render: function Render({ form, formId }) {
		const t = useTranslations();

		return (
			<form.AppForm>
				<form.Form formId={formId} className="flex flex-col gap-4">
					<form.AppField
						name="name"
						children={(field) => (
							<field.SimpleField label={t('dashboard.textures.form.name.label')}>
								<Input
									type="text"
									placeholder={t('dashboard.textures.form.name.placeholder')}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.SimpleField>
						)}
					/>

					<form.AppField
						name="description"
						children={(field) => (
							<field.SimpleField
								label={t('dashboard.textures.form.description.label')}
							>
								<Textarea
									placeholder={t(
										'dashboard.textures.form.description.placeholder',
									)}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</field.SimpleField>
						)}
					/>

					<form.AppField
						name="file"
						children={(field) => (
							<field.SimpleField label={t('dashboard.textures.form.file.label')}>
								<Input
									type="file"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (!file) return;

										void fileToBase64(file).then((base64) => {
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
							<field.SimpleField
								label={t('dashboard.textures.form.type.label')}
								desc={t('dashboard.textures.form.type.description')}
							>
								<SegmentedControl
									value={field.state.value}
									onValueChange={(value) => {
										field.handleChange(value as 'skin' | 'skin_slim' | 'cape');
									}}
									className="blcok w-full"
								>
									<SegmentedControlItem value="skin">
										{t('dashboard.textures.form.type.skin')}
									</SegmentedControlItem>
									<SegmentedControlItem value="skin_slim">
										{t('dashboard.textures.form.type.skinSlim')}
									</SegmentedControlItem>
									<SegmentedControlItem value="cape">
										{t('dashboard.textures.form.type.cape')}
									</SegmentedControlItem>
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
