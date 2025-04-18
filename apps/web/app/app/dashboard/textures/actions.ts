'use server';

import type { CreateTextureFormValues } from '~web/libs/modules/textures/forms/CreateTextureForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { createTexture, uploadTexture } from '~web/libs/actions/api';
import { eitherToResp, formError } from '~web/libs/forms/responses';

export async function handleCreateTexture(form: CreateTextureFormValues) {
	const fileBytes = Uint8Array.fromBase64(form.file.base64);
	const file = new File([fileBytes], form.file.name, { type: form.file.type });

	const requests = EitherAsync.fromPromise(() =>
		uploadTexture({
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
