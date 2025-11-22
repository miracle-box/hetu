'use server';

import type { CreateTextureFormValues } from '~web/libs/modules/textures/forms/CreateTextureForm';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { uploadFile } from '~web/libs/actions/api/files';
import { createTexture } from '~web/libs/actions/api/textures';
import { eitherToResp, respToEither } from '~web/libs/api/resp';
import { formError } from '~web/libs/utils/form';

export async function handleCreateTexture(form: CreateTextureFormValues) {
	const fileBytes = Uint8Array.fromBase64(form.file.base64);
	const file = new File([fileBytes], form.file.name, { type: form.file.type });

	const requests = EitherAsync.liftEither(
		respToEither(
			await uploadFile({
				// Type is manually checked above.
				file: file,
				type: form.type === 'cape' ? 'texture_cape' : 'texture_skin',
			}),
		),
	)
		.chain(async (resp) =>
			respToEither(
				await createTexture({
					name: form.name,
					description: form.description,
					hash: resp.file.hash,
					type: form.type,
				}),
			),
		)
		.mapLeft(({ message }) => formError(message));

	return eitherToResp(await requests.run());
}
