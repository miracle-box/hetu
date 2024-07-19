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
	.post(
		'/signout',
		({ body, set }) => {
			// Return 204 if signed out (whether the token is valid or invalid)
			AuthService.signout(body);
			set.status = 'No Content';
		},
		{
			body: 'auth.signout.body',
			response: {
				204: t.Void(),
			},
		},
	)
	.post(
		'/signoutAll',
		({ set }) => {
			// [TODO] Retrieve user ID from auth middleware
			// AuthService.signoutAll();
			set.status = 'No Content';
		},
		{
			response: {
				204: t.Void(),
			},
		},
	);
