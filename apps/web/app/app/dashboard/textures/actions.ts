'use server';

import type { Static } from '@sinclair/typebox';
import type { CreateTextureFormValues } from '~web/libs/modules/textures/forms/CreateTextureForm';
import { ProfilesDtos } from '@repo/api-client';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { createTexture, getUserProfiles, updateProfile, uploadFile } from '~web/libs/actions/api';
import { formError } from '~web/libs/utils/form';
import { eitherToResp } from '~web/libs/utils/resp';

export async function handleCreateTexture(form: CreateTextureFormValues) {
	const fileBytes = Uint8Array.fromBase64(form.file.base64);
	const file = new File([fileBytes], form.file.name, { type: form.file.type });

	const requests = EitherAsync.fromPromise(() =>
		uploadFile({
			// Type is manually checked above.
			file: file,
			type: form.type === 'cape' ? 'texture_cape' : 'texture_skin',
		}),
	)
		.chain((resp) =>
			createTexture({
				name: form.name,
				description: form.description,
				hash: resp.file.hash,
				type: form.type,
			}),
		)
		.mapLeft((message) => formError(message));

	return eitherToResp(await requests.run());
}

export const handleGetUserProfiles = async () => eitherToResp(await getUserProfiles());
export const handleUpdateUserProfile = async (
	id: string,
	body: Static<(typeof ProfilesDtos.updateProfileDtoSchemas)['body']>,
) => eitherToResp(await updateProfile(id, body));
