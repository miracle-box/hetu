import { Elysia } from 'elysia';
import { AuthRoutes } from '~backend/auth/auth.routes';
import { FilesRoutes } from '~backend/files/files.routes';
import { ProfilesRoutes } from '~backend/profiles/profiles.routes';
import { middlewares } from '~backend/shared/middlewares';
import { TexturesRoutes } from '~backend/textures/textures.routes';
import { UsersRoutes } from '~backend/users/users.routes';
import { YggdrasilRoutes } from '~backend/yggdrasil/yggdrasil.routes';

export const app = new Elysia()
	// Putting yggdrasil routes here avoids the error being handled twice
	//  [TODO] I'm Looking for solutions better than this.
	.use(YggdrasilRoutes)
	.use(middlewares)
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
