import { Elysia } from 'elysia';
import { yggdrasilErrorsHandler } from './utils/errors';
import { authenticateHandler } from './webapis/authserver/authenticate';
import { invalidateHandler } from './webapis/authserver/invalidate';
import { refreshHandler } from './webapis/authserver/refresh';
import { signoutHandler } from './webapis/authserver/signout';
import { validateHandler } from './webapis/authserver/validate';
import { prejoinHandler } from './webapis/custom/prejoin';
import { getMetadataHandler } from './webapis/get-metadata';
import { getProfilesHandler } from './webapis/mojangapi/get-profiles';
import { resetTextureHandler } from './webapis/mojangapi/reset-texture';
import { uploadTextureHandler } from './webapis/mojangapi/upload-texture';
import { getProfileHandler } from './webapis/sessionserver/get-profile';
import { hasJoinedHandler } from './webapis/sessionserver/has-joined';
import { joinServerHandler } from './webapis/sessionserver/join-server';

export const YggdrasilRoutes = new Elysia({
	name: 'Routes.Yggdrasil',
	prefix: '/yggdrasil',
})
	.use(yggdrasilErrorsHandler)
	.group('', (app) => app.use(getMetadataHandler))
	.group('/authserver', (app) =>
		app
			.use(authenticateHandler)
			.use(refreshHandler)
			.use(validateHandler)
			.use(invalidateHandler)
			.use(signoutHandler),
	)
	.group('/sessionserver', (app) =>
		app.use(getProfileHandler).use(hasJoinedHandler).use(joinServerHandler),
	)
	.group('/api', (app) =>
		app.use(getProfilesHandler).use(uploadTextureHandler).use(resetTextureHandler),
	)
	.group('/custom', (app) => app.use(prejoinHandler));
