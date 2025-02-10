import { Elysia } from 'elysia';
import { refreshHandler } from '~backend/auth/webapis/refresh';
import { validateHandler } from '~backend/auth/webapis/validate';
import { getProfilesHandler } from '~backend/yggdrasil/webapis/mojangapi/get-profiles';
import { resetTextureHandler } from '~backend/yggdrasil/webapis/mojangapi/reset-texture';
import { uploadTextureHandler } from '~backend/yggdrasil/webapis/mojangapi/upload-texture';
import { getProfileHandler } from '~backend/yggdrasil/webapis/sessionserver/get-profile';
import { hasJoinedHandler } from '~backend/yggdrasil/webapis/sessionserver/has-joined';
import { joinServerHandler } from '~backend/yggdrasil/webapis/sessionserver/join-server';
import { yggdrasilErrorsHandler } from './utils/errors';
import { authenticateHandler } from './webapis/authserver/authenticate';
import { invalidateHandler } from './webapis/authserver/invalidate';
import { signoutHandler } from './webapis/authserver/signout';
import { getMetadataHandler } from './webapis/get-metadata';
import { prejoinHandler } from './webapis/custom/prejoin';

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
