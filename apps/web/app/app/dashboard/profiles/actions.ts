'use server';

import type { CreateProfileFormValues } from '~web/libs/modules/profiles/forms/CreateProfileForm';
import { createProfile } from '~web/libs/actions/api';
import { eitherToResp } from '~web/libs/utils/resp';
import { formError } from '~web/libs/utils/form';

export async function handleCreateProfile(form: CreateProfileFormValues) {
	const resp = (await createProfile(form)).mapLeft((error) => formError(error));
	return eitherToResp(resp);
}
