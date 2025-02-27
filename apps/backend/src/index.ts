import { Elysia } from 'elysia';
import { AuthRoutes } from '~backend/auth/auth.routes';
import { FilesRoutes } from '~backend/files/files.routes';
import { ProfilesRoutes } from '~backend/profiles/profiles.routes';
import { middlewares } from '~backend/shared/middlewares';
import { TexturesRoutes } from '~backend/textures/textures.routes';
import { UsersRoutes } from '~backend/users/users.routes';
import { YggdrasilRoutes } from '~backend/yggdrasil/yggdrasil.routes';
import { Config, initConfig } from './shared/config';
import { Logger } from './shared/logger';
initConfig();

const app = new Elysia()
	// Putting yggdrasil routes here avoids the error being handled twice
	//  [TODO] I'm Looking for solutions better than this.
	.use(YggdrasilRoutes)
	.use(middlewares)
	.use(AuthRoutes)
	.use(FilesRoutes)
	.use(UsersRoutes)
	.use(ProfilesRoutes)
	.use(TexturesRoutes)
	.listen(Config.app.listenTo);

Logger.info(`Service started on ${app.server?.url?.toString()}`);

export type App = typeof app;
