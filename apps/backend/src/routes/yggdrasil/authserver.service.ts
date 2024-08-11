import { lucia } from '~/auth/lucia';
import { AuthService } from '../auth/auth.service';
import {
	AuthRequest,
	AuthResponse,
	RefreshRequest,
	RefreshResponse,
	TokenOpRequest,
} from './authserver';
import { db } from '~/db/connection';
import { sessionTable } from '~/db/schema/auth';
import { and, eq } from 'drizzle-orm';

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
		// [TODO] Probably move this into AuthService.validate()
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

	static async validate(body: TokenOpRequest): Promise<boolean> {
		// [TODO] Move this to a middleware probably, or just don't check for scopes?
		// Lucia will automatically extend the session expiration,
		// we don't want that for tokens that are not for Yggdrasil APIs.
		// [TODO] But this results in an extra database query, which is not ideal!
		const yggSessionExists = await db
			.select()
			.from(sessionTable)
			.where(and(eq(sessionTable.id, body.accessToken), eq(sessionTable.scope, 'yggdrasil')))
			.then(({ length }) => length > 0);
		if (!yggSessionExists) return false;

		const { session } = await lucia.validateSession(body.accessToken);
		// [TODO] Probably move this into AuthService.validate()
		if (
			!session ||
			// When client token is provided, check if it matches, otherwise ignore it.
			(body.clientToken && body.clientToken !== session.metadata.clientToken)
		)
			return false;

		return true;
	}

	static async invalidate(body: TokenOpRequest): Promise<void> {
		// [TODO] Move this to a middleware probably, or just don't check for scopes?
		// Lucia will automatically extend the session expiration,
		// we don't want that for tokens that are not for Yggdrasil APIs.
		// [TODO] But this results in an extra database query, which is not ideal!
		const yggSessionExists = await db
			.select()
			.from(sessionTable)
			.where(and(eq(sessionTable.id, body.accessToken), eq(sessionTable.scope, 'yggdrasil')))
			.then(({ length }) => length > 0);
		if (!yggSessionExists) return;

		lucia.invalidateSession(body.accessToken);
	}
}
