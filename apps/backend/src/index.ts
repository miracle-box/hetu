import swagger from '@elysiajs/swagger';
import { AuthController } from './routes/auth/auth.controller';
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
				],
			},
		}),
	)
	.use(AuthController)
	.listen(3000);

console.log(`Service is running at ${app.server?.hostname}:${app.server?.port}`);
