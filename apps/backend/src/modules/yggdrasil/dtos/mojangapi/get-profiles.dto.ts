import { t } from 'elysia';
import { yggProfileDigestSchema } from '../../yggdrasil.entities';

export const getProfilesDtoSchemas = {
	body: t.Array(t.String()),
	response: {
		200: t.Array(yggProfileDigestSchema),
	},
};
