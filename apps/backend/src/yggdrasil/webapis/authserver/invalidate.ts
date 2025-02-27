import { Elysia, t } from 'elysia';
import { SessionService } from '~backend/services/auth/session';
import { validateTokenMiddleware } from '~backend/yggdrasil/validate-token.middleware';
import { yggTokenSchema } from '~backend/yggdrasil/yggdrasil.entities';

export const invalidateHandler = new Elysia().use(validateTokenMiddleware(false)).post(
	'/invalidate',
	async ({ set, session }) => {
		set.status = 'No Content';
		await SessionService.revoke(session.id);
	},
	{
		body: yggTokenSchema,
		response: {
			204: t.Void(),
		},
		detail: {
			summary: 'Invalidate Token',
			description: 'Invalidate the token.',
			tags: ['Yggdrasil'],
		},
	},
);
