import swagger from '@elysiajs/swagger';
import { AuthController } from './routes/auth/auth.controller';
import { TexturesController } from './routes/textures/textures.controller';
import { Elysia } from 'elysia';

const app = new Elysia()
	.use(
		swagger({
			documentation: {
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
						name: 'Textures',
						description: 'API for managing textures.',
					},
				],
			},
		}),
	)
	.use(AuthController)
	.use(TexturesController)
	.listen(3000);

console.log(`Service is running at ${app.server?.hostname}:${app.server?.port}`);
