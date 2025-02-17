import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { Config } from '~backend/shared/config';
import { version } from '~backend/../package.json';

export const swaggerMiddleware = (app: Elysia) =>
	app.use(
		swagger({
			documentation: {
				info: {
					title: 'Hetu API',
					version,
				},
				servers: [
					{
						url: Config.app.baseUrl,
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
	);
