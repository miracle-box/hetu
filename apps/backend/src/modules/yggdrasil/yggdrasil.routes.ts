import { Elysia } from 'elysia';
import { authenticateHandler } from '#modules/yggdrasil/webapis/authserver/authenticate.handler';
import { invalidateHandler } from '#modules/yggdrasil/webapis/authserver/invalidate.handler';
import { refreshHandler } from '#modules/yggdrasil/webapis/authserver/refresh.handler';
import { signoutHandler } from '#modules/yggdrasil/webapis/authserver/signout.handler';
import { validateHandler } from '#modules/yggdrasil/webapis/authserver/validate.handler';
import { prejoinHandler } from '#modules/yggdrasil/webapis/custom/prejoin.handler';
import { getMetadataHandler } from '#modules/yggdrasil/webapis/get-metadata.handler';
import { getPlayerUuidHandler } from '#modules/yggdrasil/webapis/mojangapi/get-player-uuid.handler';
import { getProfilesHandler } from '#modules/yggdrasil/webapis/mojangapi/get-profiles.handler';
import { resetTextureHandler } from '#modules/yggdrasil/webapis/mojangapi/reset-texture.handler';
import { uploadTextureHandler } from '#modules/yggdrasil/webapis/mojangapi/upload-texture.handler';
import { getProfileHandler } from '#modules/yggdrasil/webapis/sessionserver/get-profile.handler';
import { hasJoinedHandler } from '#modules/yggdrasil/webapis/sessionserver/has-joined.handler';
import { joinServerHandler } from '#modules/yggdrasil/webapis/sessionserver/join-server.handler';

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
	.group('', (app) => app.use(getPlayerUuidHandler))
	.group('/custom', (app) => app.use(prejoinHandler));
