import { Elysia } from 'elysia';
import { AuthRoutes } from '~backend/modules/auth/auth.routes';
import { FilesRoutes } from '~backend/modules/files/files.routes';
import { ProfilesRoutes } from '~backend/modules/profiles/profiles.routes';
import { TexturesRoutes } from '~backend/modules/textures/textures.routes';
import { UsersRoutes } from '~backend/modules/users/users.routes';
import { middlewares } from '~backend/shared/middlewares';
import { YggdrasilRoutes } from './modules/yggdrasil/yggdrasil.routes';

export const app = new Elysia({
	name: 'App',
})
	.use(middlewares)
	.use(YggdrasilRoutes)
	.use(AuthRoutes)
	.use(FilesRoutes)
	.use(UsersRoutes)
	.use(ProfilesRoutes)
	.use(TexturesRoutes);

export const startApp = (listenTo: string) => {
	// It's fine to ignore promises here.
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	process.on('beforeExit', app.stop);
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	process.on('SIGINT', app.stop);
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	process.on('SIGTERM', app.stop);

	app.listen(listenTo);
};
