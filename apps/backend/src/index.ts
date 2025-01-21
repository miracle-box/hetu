import { Elysia } from 'elysia';
import { version } from '../package.json';
import swagger from '@elysiajs/swagger';
import { AuthRoutes } from '~backend/auth/auth.routes';
import { TexturesRoutes } from '~backend/textures/textures.routes';
import { ProfilesRoutes } from '~backend/profiles/profiles.routes';
import { YggdrasilRoutes } from '~backend/yggdrasil/yggdrasil.routes';
import { FilesRoutes } from '~backend/files/files.routes';
import { UsersRoutes } from '~backend/users/users.routes';

const app = new Elysia()
	.use(
		swagger({
			documentation: {
				info: {
					title: 'Hetu API',
					version,
				},
				servers: [
					{
						url: process.env.BASE_URL,
						description: 'Production server',
					},
					{
						url: 'http://localhost:3000',
						description: 'Local development server',
					},
				],
				components: {
					securitySchemes: {
						session: {
							type: 'http',
							scheme: 'bearer',
							bearerFormat: 'Session ID and token',
						},
					},
				},
				tags: [
					{
						name: 'Authentication',
						description: 'Authentication related APIs.',
					},
					{
						name: 'General',
						description: 'API for general actions.',
					},
					{
						name: 'Users',
						description: 'API for managing user info.',
					},
					{
						name: 'Textures',
						description: 'API for managing textures.',
					},
					{
						name: 'Profiles',
						description: 'API for managing player profiles.',
					},
					{
						name: 'Yggdrasil',
						description: 'API for authlib-injector.',
					},
					{
						name: 'Yggdrasil Custom',
						description: 'Our own extension for authlib-injector APIs.',
					},
				],
			},
		}),
	)
	.use(AuthRoutes)
	.use(FilesRoutes)
	.use(UsersRoutes)
	.use(ProfilesRoutes)
	.use(TexturesRoutes)
	.use(YggdrasilRoutes)
	.listen(3000);

console.log(`Service is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
