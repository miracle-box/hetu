'use server';

import { CreateProfileFormValues } from './shared';
import { createProfile } from '~web/libs/actions/api';
import { formError, formSuccess } from '~web/libs/form/responses';

export async function handleCreateProfile(form: CreateProfileFormValues) {
	const profile = await createProfile({ name: form.name });
	if (!profile) return formError('Unable to create profile.');

	return formSuccess(profile);
}
