import { Elysia } from 'elysia';
import { authenticateHandler } from './webapis/authserver/authenticate.handler';
import { invalidateHandler } from './webapis/authserver/invalidate.handler';
import { refreshHandler } from './webapis/authserver/refresh.handler';
import { signoutHandler } from './webapis/authserver/signout.handler';
import { validateHandler } from './webapis/authserver/validate.handler';
import { prejoinHandler } from './webapis/custom/prejoin.handler';
import { getMetadataHandler } from './webapis/get-metadata.handler';
import { getProfilesHandler } from './webapis/mojangapi/get-profiles.handler';
import { resetTextureHandler } from './webapis/mojangapi/reset-texture.handler';
import { uploadTextureHandler } from './webapis/mojangapi/upload-texture.handler';
import { getProfileHandler } from './webapis/sessionserver/get-profile.handler';
import { hasJoinedHandler } from './webapis/sessionserver/has-joined.handler';
import { joinServerHandler } from './webapis/sessionserver/join-server.handler';

export const YggdrasilRoutes = new Elysia({
	name: 'Routes.Yggdrasil',
	prefix: '/yggdrasil',
})
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
