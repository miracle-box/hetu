'use server';

import type { API } from '@repo/api-client';
import { client as api } from '#/libs/api/eden';
import { handleResponse } from '#/libs/api/response';
import { readSession } from '../auth';

export async function uploadFile(body: API.Files.UploadFile.Body) {
	const session = await readSession();

	return await handleResponse(
		api.files.post(
			{
				type: body.type,
				file: body.file,
			},
			{
				headers: { Authorization: `Bearer ${session.authToken}` },
			},
		),
	);
}
