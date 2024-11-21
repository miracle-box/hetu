import { Elysia } from 'elysia';
import { version } from '../package.json';
import swagger from '@elysiajs/swagger';
import { AuthRoutes } from '~/auth/auth.routes';
import { TexturesRoutes } from '~/textures/textures.routes';
import { ProfilesRoutes } from '~/profiles/profiles.routes';
import { YggdrasilController } from '~/yggdrasil/yggdrasil';
import { FilesRoutes } from '~/files/files.routes';

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
						sessionId: {
							type: 'http',
							scheme: 'bearer',
							bearerFormat: 'Session ID',
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
						name: 'Textures',
						description: 'API for managing textures.',
					},
					{
						name: 'Profiles',
						description: 'API for managing player profiles.',
					},
					{
						name: 'Yggdrasil',
						description: 'API for authlib-injector. (authlib injector APIs)',
					},
					{
						name: 'Yggdrasil Auth',
						description: 'API for authlib-injector. (authserver APIs)',
					},
					{
						name: 'Yggdrasil Session',
						description: 'API for authlib-injector. (sessionserver APIs)',
					},
					{
						name: 'Yggdrasil Mojang',
						description: 'API for authlib-injector. (Mojang APIs)',
					},
					{
						name: 'Yggdrasil Custom',
						description: 'API for authlib-injector. (our custom APIs)',
					},
				],
			},
		}),
	)
	.use(AuthRoutes)
	.use(FilesRoutes)
	.use(ProfilesRoutes)
	.use(TexturesRoutes)
	.use(YggdrasilController)
	.listen(3000);

console.log(`Service is running at ${app.server?.hostname}:${app.server?.port}`);
