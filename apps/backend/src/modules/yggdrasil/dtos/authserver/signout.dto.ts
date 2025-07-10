import { t } from 'elysia';
import { createDtoSchemas } from '~backend/shared/middlewares/dto/schemas';
import { yggCredentialsSchema } from '../../yggdrasil.entities';

export const signoutDtoSchemas = createDtoSchemas({
	body: yggCredentialsSchema,
	response: {
		204: t.Void(),
	},
});
