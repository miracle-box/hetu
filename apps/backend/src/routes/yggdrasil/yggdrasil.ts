import Elysia, { t } from 'elysia';
import { metadata, metadataResponseSchema } from './metadata';
import { AuthserverModel } from './authserver';
import { SessionserverModel } from './sessionserver';
import { MojangApiModel } from './mojang';

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
				body: 'yggdrasil.auth.auth.body',
				response: 'yggdrasil.auth.auth.response',
				detail: {
					summary: 'Sign in',
					description: 'Sign in by email and password.',
					tags: ['Yggdrasil Auth'],
				},
			})
			.post('/refresh', () => {}, {
				body: 'yggdrasil.auth.refresh.body',
				response: 'yggdrasil.auth.refresh.response',
				detail: {
					summary: 'Resfesh Token',
					description: 'Get a new token and invalidate the old one.',
					tags: ['Yggdrasil Auth'],
				},
			})
			.post('/validate', () => {}, {
				body: 'yggdrasil.auth.validate.body',
				response: {
					204: t.Void(),
				},
				detail: {
					summary: 'Validate Token',
					description: 'Check if the token is valid.',
					tags: ['Yggdrasil Auth'],
				},
			})
			.post('/invalidate', () => {}, {
				body: 'yggdrasil.auth.invalidate.body',
				response: {
					204: t.Void(),
				},
				detail: {
					summary: 'Invalidate Token',
					description: 'Invalidate the token.',
					tags: ['Yggdrasil Auth'],
				},
			})
			.post('/signout', () => {}, {
				body: 'yggdrasil.auth.signout.body',
				response: {
					204: t.Void(),
				},
				detail: {
					summary: 'Sign Out',
					description: 'Invalidate all tokens of the user.',
					tags: ['Yggdrasil Auth'],
				},
			}),
	)
	.group('/sessionserver', (app) =>
		app
			.use(SessionserverModel)
			.post('/session/minecraft/join', () => {}, {
				body: 'yggdrasil.session.join.body',
				response: {
					204: t.Void(),
				},
				detail: {
					summary: 'Join Server',
					description: 'Log client info for validation.',
					tags: ['Yggdrasil Session'],
				},
			})
			.get('/session/minecraft/hasJoined', () => {}, {
				query: 'yggdrasil.session.hasjoined.query',
				response: 'yggdrasil.session.hasjoined.response',
				detail: {
					summary: 'Validate Client',
					description: 'Validates client and get their profile.',
					tags: ['Yggdrasil Session'],
				},
			})
			.get('/session/minecraft/profile/:id', () => {}, {
				query: 'yggdrasil.session.profile.query',
				response: 'yggdrasil.session.profile.response',
				detail: {
					summary: 'Get Profile',
					description: 'Get profile info by UUID.',
					tags: ['Yggdrasil Session'],
				},
			}),
	)
	.group('/api', (app) =>
		app
			.use(MojangApiModel)
			.post('/profiles/minecraft', () => {}, {
				body: 'yggdrasil.mojang.get-profiles.body',
				response: 'yggdrasil.mojang.get-profiles.response',
				detail: {
					summary: 'Get Profiles',
					description: 'Get all profiles of the user.',
					tags: ['Yggdrasil Mojang'],
				},
			})
			.put('/user/profile/:id/:type', () => {}, {
				query: 'yggdrasil.mojang.upload-texture.query',
				body: 'yggdrasil.mojang.upload-texture.body',
				response: {
					204: t.Void(),
				},
				detail: {
					summary: 'Upload Texture',
					description:
						"Upload texture for profile, will automatically create a new texture if it doesn't exist.",
					tags: ['Yggdrasil Mojang'],
				},
			})
			.delete('/user/profile/:id/:type', () => {}, {
				query: 'yggdrasil.mojang.reset-texture.query',
				response: {
					204: t.Void(),
				},
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
