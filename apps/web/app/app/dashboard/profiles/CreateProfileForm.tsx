'use client';

import type { CreateProfileFormApi } from './shared';
import { Input } from '@repo/ui/input';
import { useStore } from '@tanstack/react-form';
import React from 'react';

type Props = {
	form: CreateProfileFormApi;
};

export function CreateProfileForm({ form }: Props) {
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
