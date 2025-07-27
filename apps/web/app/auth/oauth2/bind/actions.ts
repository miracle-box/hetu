'use server';

import type { AuthDtos } from '@repo/api-client';
import type { Static } from 'elysia';
import { confirmOauth2Binding } from '~web/libs/actions/api/auth';
import { eitherToResp } from '~web/libs/utils/resp';

export async function handleConfirmOauth2Binding(
	params: Static<(typeof AuthDtos.confirmOauth2BindingDtoSchemas)['params']>,
) {
	return eitherToResp(await confirmOauth2Binding(params));
}
