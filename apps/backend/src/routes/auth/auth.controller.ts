import { AuthModel } from './auth.model';
import Elysia, { t } from 'elysia';
import { AuthService } from './auth.service';

export const AuthController = new Elysia({ name: 'Controller.Auth' })
	.use(AuthModel)
	.post('/signup', ({ body }) => AuthService.signup(body), {
		body: 'auth.signup.body',
		response: 'auth.signin.response',
	})
	.post('/signin', ({ body }) => AuthService.signin(body), {
		body: 'auth.signin.body',
		response: 'auth.signin.response',
	})
	.post('/session/renew', () => {}, {})
	.get('/session', () => {}, {})
	.get('/session/:uid', () => {}, {})
	.delete('/session', () => {}, {})
	.delete('/session/:uid', () => {}, {});
