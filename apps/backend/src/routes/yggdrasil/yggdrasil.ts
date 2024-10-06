import Elysia, { t } from 'elysia';
import { metadata, metadataResponseSchema } from './metadata';
import { AuthserverModel } from './authserver';
import { SessionserverModel } from './sessionserver';
import { MojangApiModel } from './mojang';
import { CustomApiModel } from './custom';
import { AuthserverService } from './authserver.service';
import { SessionserverService } from './sessionserver.service';
import { MojangApiService } from './mojang.service';
import { authMiddleware } from '~/auth/middleware';
import { DbTextureType } from '~/models/texture';

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
			.post('/authenticate', async ({ body }) => await AuthserverService.authenticate(body), {
				body: 'yggdrasil.auth.auth.body',
				response: 'yggdrasil.auth.auth.response',
				detail: {
					summary: 'Sign in',
					description: 'Sign in by email and password.',
					tags: ['Yggdrasil Auth'],
				},
			})
			.post('/refresh', async ({ body }) => await AuthserverService.refresh(body), {
				body: 'yggdrasil.auth.refresh.body',
				response: 'yggdrasil.auth.refresh.response',
				detail: {
					summary: 'Resfesh Token',
					description: 'Get a new token and invalidate the old one.',
					tags: ['Yggdrasil Auth'],
				},
			})
			.post(
				'/validate',
				async ({ body, set }) => {
					const tokenValid = await AuthserverService.validate(body);
					if (tokenValid) set.status = 'No Content';
					else set.status = 'Unauthorized';
				},
				{
					body: 'yggdrasil.auth.validate.body',
					response: {
						204: t.Void(),
					},
					detail: {
						summary: 'Validate Token',
						description: 'Check if the token is valid.',
						tags: ['Yggdrasil Auth'],
					},
				},
			)
			.post(
				'/invalidate',
				async ({ body, set }) => {
					await AuthserverService.invalidate(body);
					set.status = 'No Content';
				},
				{
					body: 'yggdrasil.auth.invalidate.body',
					response: {
						204: t.Void(),
					},
					detail: {
						summary: 'Invalidate Token',
						description: 'Invalidate the token.',
						tags: ['Yggdrasil Auth'],
					},
				},
			)
			.post(
				'/signout',
				async ({ body, set }) => {
					await AuthserverService.signout(body);
					set.status = 'No Content';
				},
				{
					body: 'yggdrasil.auth.signout.body',
					response: {
						204: t.Void(),
					},
					detail: {
						summary: 'Sign Out',
						description: 'Invalidate all tokens of the user.',
						tags: ['Yggdrasil Auth'],
					},
				},
			),
	)
	.group('/sessionserver', (app) =>
		app
			.use(SessionserverModel)
			.post(
				'/session/minecraft/join',
				async ({ body, set }) => {
					await SessionserverService.joinServer(body);
					set.status = 'No Content';
				},
				{
					body: 'yggdrasil.session.join.body',
					response: {
						204: t.Void(),
					},
					detail: {
						summary: 'Join Server',
						description: 'Log client info for validation.',
						tags: ['Yggdrasil Session'],
					},
				},
			)
			.get(
				'/session/minecraft/hasJoined',
				async ({ query, set }) => {
					const profile = await SessionserverService.hasJoined(query);
					if (profile) return profile;
					else set.status = 'No Content';
				},
				{
					query: 'yggdrasil.session.hasjoined.query',
					response: {
						200: 'yggdrasil.session.hasjoined.response',
						204: t.Void(),
					},
					detail: {
						summary: 'Validate Client',
						description: 'Validates client and get their profile.',
						tags: ['Yggdrasil Session'],
					},
				},
			)
			.get(
				'/session/minecraft/profile/:id',
				async ({ params, query }) =>
					await SessionserverService.getProfile(params.id, query.unsigned),
				{
					params: 'yggdrasil.session.profile.params',
					query: 'yggdrasil.session.profile.query',
					response: 'yggdrasil.session.profile.response',
					detail: {
						summary: 'Get Profile',
						description: 'Get profile info by UUID.',
						tags: ['Yggdrasil Session'],
					},
				},
			),
	)
	.group('/api', (app) =>
		app
			.use(MojangApiModel)
			.post(
				'/profiles/minecraft',
				async ({ body }) => await MojangApiService.getProfilesByNames(body),
				{
					body: 'yggdrasil.mojang.get-profiles.body',
					response: 'yggdrasil.mojang.get-profiles.response',
					detail: {
						summary: 'Get Profiles',
						description: 'Get profiles of requested users.',
						tags: ['Yggdrasil Mojang'],
					},
				},
			)
			.use(authMiddleware('yggdrasil'))
			.put(
				'/user/profile/:id/:type',
				async ({ params, body, set }) => {
					const type: DbTextureType =
						params.type === 'cape'
							? 'cape'
							: body.model === 'slim'
								? 'skin_slim'
								: 'skin';

					await MojangApiService.uploadTexture(params.id, type, body.file);
					set.status = 'No Content';
				},
				{
					params: 'yggdrasil.mojang.upload-texture.params',
					body: 'yggdrasil.mojang.upload-texture.body',
					response: {
						204: t.Void(),
					},
					detail: {
						summary: 'Upload Texture',
						description:
							"Upload texture for profile, will automatically create a new texture if it doesn't exist.",
						security: [{ sessionId: [] }],
						tags: ['Yggdrasil Mojang'],
					},
				},
			)
			.delete(
				'/user/profile/:id/:type',
				async ({ params, set }) => {
					await MojangApiService.resetTexture(params.id, params.type);
					set.status = 'No Content';
				},
				{
					params: 'yggdrasil.mojang.reset-texture.params',
					response: {
						204: t.Void(),
					},
					detail: {
						summary: 'Reset Texture',
						description: 'Reset texture to default.',
						security: [{ sessionId: [] }],
						tags: ['Yggdrasil Mojang'],
					},
				},
			),
	)
	.group('/custom', (app) =>
		app.use(CustomApiModel).post('/prejoin', () => {}, {
			body: 'yggdrasil.custom.prejoin.body',
			response: {
				204: t.Void(),
			},
			detail: {
				summary: 'AnyLogin Prejoin',
				description:
					'*(For AnyLogin)* Log player info to us in prejoin stage, helps to identify player profile in our services.',
				tags: ['Yggdrasil Custom'],
			},
		}),
	);
