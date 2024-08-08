import Elysia from 'elysia';

export const YggdrasilController = new Elysia({
	name: 'Controller.Yggdrasil',
	prefix: '/yggdrasil',
})
	.group('/', (app) => app.get('', () => {}, {}))
	.group('/authserver', (app) =>
		app
			.post('/authenticate', () => {}, {})
			.post('/refresh', () => {}, {})
			.post('/validate', () => {}, {})
			.post('/invalidate', () => {}, {})
			.post('/signout', () => {}, {}),
	)
	.group('/sessionserver', (app) =>
		app
			.post('/session/minecraft/join', () => {}, {})
			.post('/session/minecraft/hasJoined', () => {}, {})
			.post('/session/minecraft/profile/:id', () => {}, {}),
	)
	.group('/api', (app) =>
		app
			.post('/profiles/minecraft', () => {}, {})
			// Automatically create a new texture if it doesn't exist (lookup by hash)
			.put('/user/profile/:id/:textureType', () => {}, {})
			.delete('/user/profile/:id/:textureType', () => {}, {}),
	)
	.group('/anylogin', (app) => app.post('/prejoin', () => {}, {}));
