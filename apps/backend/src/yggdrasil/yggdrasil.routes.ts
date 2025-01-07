import Elysia from 'elysia';
import { getMetadata, getMetadataResponse } from './webapis/get-metadata';
import {
	authenticate,
	authenticateBodySchema,
	authenticateResponseSchema,
} from './webapis/authserver/authenticate';
import { refresh, refreshBodySchema, refreshResponseSchema } from './webapis/authserver/refresh';
import { validateBodySchema, validateResponseSchema } from './webapis/authserver/validate';
import {
	invalidate,
	invalidateBodySchema,
	invalidateResponseSchema,
} from './webapis/authserver/invalidate';
import { signout, signoutBodySchema, signoutResponseSchema } from './webapis/authserver/signout';
import {
	joinServer,
	joinServerBodySchema,
	joinServerResponseSchema,
} from '~backend/yggdrasil/webapis/sessionserver/join-server';
import {
	hasJoined,
	hasJoinedQuerySchema,
	hasJoinedResponse200Schema,
	hasJoinedResponse204Schema,
} from '~backend/yggdrasil/webapis/sessionserver/has-joined';
import {
	getProfile,
	getProfileParamsSchema,
	getProfileQuerySchema,
	getProfileResponseSchema,
} from '~backend/yggdrasil/webapis/sessionserver/get-profile';
import {
	getProfiles,
	getProfilesBodySchema,
	getProfilesResponseSchema,
} from '~backend/yggdrasil/webapis/mojangapi/get-profiles';
import { authMiddleware } from '~backend/shared/auth/middleware';
import {
	uploadTexture,
	uploadTextureBodySchema,
	uploadTextureParamsSchema,
	uploadTextureResponseSchema,
} from '~backend/yggdrasil/webapis/mojangapi/upload-texture';
import {
	resetTexture,
	resetTextureParamsSchema,
	resetTextureResponseSchema,
} from '~backend/yggdrasil/webapis/mojangapi/reset-texture';
import { SessionScope } from '~backend/auth/auth.entities';
import { validateTokenMiddleware } from '~backend/yggdrasil/validate-token.middleware';

export const YggdrasilRoutes = new Elysia({
	name: 'Routes.Yggdrasil',
	prefix: '/yggdrasil',
})
	.group('/', (app) =>
		app.get('', async () => getMetadata(), {
			response: {
				200: getMetadataResponse,
			},
			detail: {
				summary: 'Get Metadata',
				description: 'API metadata for authlib injector.',
				tags: ['Yggdrasil'],
			},
		}),
	)
	.group('/authserver', (app) =>
		app
			.post('/authenticate', async ({ body }) => await authenticate(body), {
				body: authenticateBodySchema,
				response: {
					200: authenticateResponseSchema,
				},
				detail: {
					summary: 'Sign in',
					description: 'Sign in by email and password.',
					tags: ['Yggdrasil'],
				},
			})
			.post(
				'/signout',
				async ({ body, set }) => {
					await signout(body);
					set.status = 'No Content';
				},
				{
					body: signoutBodySchema,
					response: {
						204: signoutResponseSchema,
					},
					detail: {
						summary: 'Sign Out',
						description: 'Invalidate all tokens of the user.',
						tags: ['Yggdrasil'],
					},
				},
			)
			// `clientToken` requires validation
			.group('', (app) =>
				app
					.use(validateTokenMiddleware(true))
					.post('/refresh', async ({ body, session }) => await refresh(body, session), {
						body: refreshBodySchema,
						response: {
							200: refreshResponseSchema,
						},
						detail: {
							summary: 'Resfesh Token',
							description: 'Get a new token and invalidate the old one.',
							tags: ['Yggdrasil'],
						},
					})
					.post(
						'/validate',
						async ({ set }) => {
							set.status = 'No Content';
						},
						{
							body: validateBodySchema,
							response: {
								204: validateResponseSchema,
							},
							detail: {
								summary: 'Validate Token',
								description: 'Check if the token is valid.',
								tags: ['Yggdrasil'],
							},
						},
					),
			)
			// `clientToken` does not require validation
			.group('', (app) =>
				app.use(validateTokenMiddleware(false)).post(
					'/invalidate',
					async ({ body, set, session }) => {
						await invalidate(body, session);
						set.status = 'No Content';
					},
					{
						body: invalidateBodySchema,
						response: {
							204: invalidateResponseSchema,
						},
						detail: {
							summary: 'Invalidate Token',
							description: 'Invalidate the token.',
							tags: ['Yggdrasil'],
						},
					},
				),
			),
	)
	.group('/sessionserver', (app) =>
		app
			.group('', (app) =>
				app.use(validateTokenMiddleware(false)).post(
					'/session/minecraft/join',
					async ({ body, set, session }) => {
						await joinServer(body, session);
						set.status = 'No Content';
					},
					{
						body: joinServerBodySchema,
						response: {
							204: joinServerResponseSchema,
						},
						detail: {
							summary: 'Join Server',
							description: 'Log client info for validation.',
							tags: ['Yggdrasil'],
						},
					},
				),
			)
			.get(
				'/session/minecraft/hasJoined',
				async ({ query, set }) => {
					const profile = await hasJoined(query);
					if (profile) return profile;
					else set.status = 'No Content';
				},
				{
					query: hasJoinedQuerySchema,
					response: {
						200: hasJoinedResponse200Schema,
						204: hasJoinedResponse204Schema,
					},
					detail: {
						summary: 'Validate Client',
						description: 'Validates client and get their profile.',
						tags: ['Yggdrasil'],
					},
				},
			)
			.get(
				'/session/minecraft/profile/:id',
				async ({ params, query }) => await getProfile(params, query),
				{
					params: getProfileParamsSchema,
					query: getProfileQuerySchema,
					response: {
						200: getProfileResponseSchema,
					},
					detail: {
						summary: 'Get Profile',
						description: 'Get profile info by UUID.',
						tags: ['Yggdrasil'],
					},
				},
			),
	)
	.group('/api', (app) =>
		app
			.post('/profiles/minecraft', async ({ body }) => await getProfiles(body), {
				body: getProfilesBodySchema,
				response: {
					200: getProfilesResponseSchema,
				},
				detail: {
					summary: 'Get Profiles',
					description: 'Get profiles of requested users.',
					tags: ['Yggdrasil'],
				},
			})
			.use(authMiddleware(SessionScope.YGGDRASIL))
			.put(
				'/user/profile/:id/:type',
				async ({ params, body, set }) => {
					await uploadTexture(params, body);
					set.status = 'No Content';
				},
				{
					params: uploadTextureParamsSchema,
					body: uploadTextureBodySchema,
					response: {
						204: uploadTextureResponseSchema,
					},
					detail: {
						summary: 'Upload Texture',
						description:
							"Upload texture for profile, will automatically create a new texture if it doesn't exist.",
						security: [{ session: [] }],
						tags: ['Yggdrasil'],
					},
				},
			)
			.delete(
				'/user/profile/:id/:type',
				async ({ params, set }) => {
					await resetTexture(params);
					set.status = 'No Content';
				},
				{
					params: resetTextureParamsSchema,
					response: {
						204: resetTextureResponseSchema,
					},
					detail: {
						summary: 'Reset Texture',
						description: 'Reset texture to default.',
						security: [{ session: [] }],
						tags: ['Yggdrasil'],
					},
				},
			),
	)
	.group('/custom', (app) =>
		app.post('/prejoin', () => {}, {
			detail: {
				summary: 'AnyLogin Prejoin',
				description:
					'*(For AnyLogin)* Log player info to us in prejoin stage, helps to identify player profile in our services.',
				tags: ['Yggdrasil Custom'],
			},
		}),
	);
