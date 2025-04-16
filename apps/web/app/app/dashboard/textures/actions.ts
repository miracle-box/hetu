'use server';

import type { CreateTextureFormValues } from '~web/libs/modules/textures/forms/CreateTextureForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { createTexture, uploadTexture } from '~web/libs/actions/api';
import { formError, formSuccess } from '~web/libs/forms/responses';

export async function handleCreateTexture(form: CreateTextureFormValues) {
	if (!(form.file instanceof File)) return formError('File is not valid.');

	const requests = EitherAsync.fromPromise(() =>
		uploadTexture({
			// Type is manually checked above.
			file: form.file as File,
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
		.map((resp) => formSuccess(resp))
		.mapLeft((message) => formError(message));

	return requests.run();
}
