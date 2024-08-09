import Elysia from 'elysia';
import { metadata, metadataResponseSchema } from './metadata';
import { AuthserverModel } from './authserver';

export const YggdrasilController = new Elysia({
	name: 'Controller.Yggdrasil',
	prefix: '/yggdrasil',
})
	.group('/', (app) =>
		app.get('', () => metadata, {
			response: metadataResponseSchema,
			detail: {
				summary: 'Get Metadata',
				description: 'API metadata for authlib injector.',
				tags: ['Yggdrasil'],
			},
		}),
	)
	.group('/authserver', (app) =>
		app
			.use(AuthserverModel)
			.post('/authenticate', () => {}, {
				body: 'yggdrasil.authserver.auth.body',
				response: 'yggdrasil.authserver.auth.response',
				detail: {
					summary: 'Sign in',
					description: 'Sign in by email and password.',
					tags: ['Yggdrasil Auth'],
				},
			})
			.post('/refresh', () => {}, {
				detail: {
					summary: 'Resfesh Token',
					description: 'Get a new token and invalidate the old one.',
					tags: ['Yggdrasil Auth'],
				},
			})
			.post('/validate', () => {}, {
				detail: {
					summary: 'Validate Token',
					description: 'Check if the token is valid.',
					tags: ['Yggdrasil Auth'],
				},
			})
			.post('/invalidate', () => {}, {
				detail: {
					summary: 'Invalidate Token',
					description: 'Invalidate the token.',
					tags: ['Yggdrasil Auth'],
				},
			})
			.post('/signout', () => {}, {
				detail: {
					summary: 'Sign Out',
					description: 'Invalidate all tokens of the user.',
					tags: ['Yggdrasil Auth'],
				},
			}),
	)
	.group('/sessionserver', (app) =>
		app
			.post('/session/minecraft/join', () => {}, {
				detail: {
					summary: 'Join Server',
					description: 'Log client info for validation.',
					tags: ['Yggdrasil Session'],
				},
			})
			.get('/session/minecraft/hasJoined', () => {}, {
				detail: {
					summary: 'Validate Client',
					description: 'Validates client and get their profile.',
					tags: ['Yggdrasil Session'],
				},
			})
			.get('/session/minecraft/profile/:id', () => {}, {
				detail: {
					summary: 'Get Profile',
					description: 'Get profile info by UUID.',
					tags: ['Yggdrasil Session'],
				},
			}),
	)
	.group('/api', (app) =>
		app
			.post('/profiles/minecraft', () => {}, {
				detail: {
					summary: 'Get Profiles',
					description: 'Get all profiles of the user.',
					tags: ['Yggdrasil Mojang'],
				},
			})
			.put('/user/profile/:id/:type', () => {}, {
				detail: {
					summary: 'Upload Texture',
					description:
						"Upload texture for profile, will automatically create a new texture if it doesn't exist.",
					tags: ['Yggdrasil Mojang'],
				},
			})
			.delete('/user/profile/:id/:type', () => {}, {
				detail: {
					summary: 'Reset Texture',
					description: 'Reset texture to default.',
					tags: ['Yggdrasil Mojang'],
				},
			}),
	)
	.group('/anylogin', (app) =>
		app.post('/prejoin', () => {}, {
			detail: {
				summary: 'AnyLogin Prejoin',
				description:
					'*(For AnyLogin)* Log player info to us in prejoin stage, helps to identify player profile in our services.',
				tags: ['Yggdrasil Custom'],
			},
		}),
	);
