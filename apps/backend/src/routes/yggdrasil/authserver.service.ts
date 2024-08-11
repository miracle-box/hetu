import { AuthService } from '../auth/auth.service';
import { AuthRequest, AuthResponse, RefreshResponse } from './authserver';

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
			user: body.requestUser
				? {
						id: session.userId,
						properties: [],
					}
				: undefined,
			// [TODO] Include profiles.
			availableProfiles: [],
			// [TODO] Probably support automatic profile selection by allowing signin by username.
			selectedProfile: undefined,
		};
	}
}
