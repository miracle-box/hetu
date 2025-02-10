import { Elysia, t } from 'elysia';
import { validateTokenMiddleware } from '~backend/yggdrasil/validate-token.middleware';
import { yggTokenSchema } from '~backend/yggdrasil/yggdrasil.entities';

export const validateHandler = new Elysia().use(validateTokenMiddleware(true)).post(
	'/validate',
	async ({ set }) => {
		set.status = 'No Content';
		// Authorization middlewares handles the token validation
	},
	{
		body: yggTokenSchema,
		response: {
			204: t.Void(),
		},
		detail: {
			summary: 'Validate Token',
			description: 'Check if the token is valid.',
			tags: ['Yggdrasil'],
		},
	},
);
