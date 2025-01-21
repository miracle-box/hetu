'use server';

import { createTexture, uploadTexture } from '~web/libs/actions/api';
import { formError, formSuccess } from '~web/libs/form/responses';
import { CreateTextureFormValues } from './shared';

export async function handleCreateTexture(form: CreateTextureFormValues) {
	if (!(form.file instanceof File)) return formError('File is not valid.');

	const textureFile = await uploadTexture({
		file: form.file,
		type: form.type === 'cape' ? 'texture_cape' : 'texture_skin',
	});
	if (!textureFile) return formError('Failed to upload texture.');

	const texture = await createTexture({
		name: form.name,
		description: form.description,
		hash: textureFile.hash,
		type: form.type,
	});
	if (!texture) return formError('Failed to create texture.');

	return formSuccess(texture);
}
