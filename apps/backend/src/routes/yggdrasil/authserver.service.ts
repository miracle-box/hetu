import { lucia } from '~/auth/lucia';
import { AuthService } from '../auth/auth.service';
import { AuthRequest, AuthResponse, RefreshRequest, RefreshResponse } from './authserver';

export abstract class AuthserverService {
	static async authenticate(body: AuthRequest): Promise<AuthResponse> {
		const clientToken = body.clientToken ?? crypto.randomUUID();
		// [TODO] Error handling in Mojang's format
		const session = await AuthService.credentialsSignin(
			body.username,
			body.password,
			'yggdrasil',
			{ clientToken },
		);

		return {
			accessToken: session.id,
			clientToken,
			// [TODO] Probably move this to a separate method.
			user: body.requestUser ? { id: session.userId, properties: [] } : undefined,
			// [TODO] Include profiles.
			availableProfiles: [],
			// [TODO] Probably support automatic profile selection by allowing signin by username.
			selectedProfile: undefined,
		};
	}

	static async refresh(body: RefreshRequest): Promise<RefreshResponse> {
		const { session } = await lucia.validateSession(body.accessToken);
		// [TODO] Error handling in Mojang's format
		if (
			!session ||
			session.scope !== 'yggdrasil' ||
			// When client token is provided, check if it matches, otherwise ignore it.
			(body.clientToken && body.clientToken !== session.metadata.clientToken)
		) {
			throw new Error('Invalid session!');
		}

		const newSession = await AuthService.refresh(session);
		// Session metadata in database is not enforced.
		const clientToken = newSession.metadata.clientToken ?? crypto.randomUUID();

		return {
			accessToken: newSession.id,
			clientToken: clientToken,
			// [TODO] Probably move this to a separate method.
			user: body.requestUser ? { id: session.userId, properties: [] } : undefined,
			selectedProfile: body.selectedProfile,
		};
	}
}
