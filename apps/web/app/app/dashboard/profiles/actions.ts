'use server';

import type { CreateProfileFormValues } from '~web/libs/modules/profiles/forms/CreateProfileForm';
import { Left, Right } from 'purify-ts/Either';
import { createProfile } from '~web/libs/actions/api';
import { formError, formSuccess } from '~web/libs/forms/responses';

export async function handleCreateProfile(form: CreateProfileFormValues) {
	return (await createProfile(form))
		.mapLeft((error) => Left(formError(error)))
		.map((data) => Right(formSuccess(data)));
}
