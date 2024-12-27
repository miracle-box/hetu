import { Static, t } from 'elysia';
import { lucia } from '~/shared/auth/lucia';
import { createId } from '@paralleldrive/cuid2';
import { User } from '~/users/user.entities';
import { EnumLikeValues } from '~/shared/typing/utils';

// Entities
export const SessionScope = {
	DEFAULT: 'default',
	YGGDRASIL: 'yggdrasil',
} as const;

// Metadata differs between scopes.
export const sessionMetadataSchema = t.Union([
	t.Object({
		scope: t.Literal(SessionScope.DEFAULT),
		metadata: t.Object({}),
	}),
	t.Object({
		scope: t.Literal(SessionScope.YGGDRASIL),
		metadata: t.Object({
			clientToken: t.String(),
		}),
	}),
]);

export const sessionSchema = t.Intersect([
	t.Object({
		id: t.String(),
		uid: t.String(),
		userId: t.String(),
		expiresAt: t.Date(),
	}),
	sessionMetadataSchema,
]);

export const sessionDigestSchema = t.Omit(sessionSchema, ['id', 'metadata']);

export type SessionScope = EnumLikeValues<typeof SessionScope>;
export type Session = Static<typeof sessionSchema>;
export type SessionMetadata = Static<typeof sessionMetadataSchema>;
export type SessionDigest = Static<typeof sessionDigestSchema>;

/**
 * Session handling related utilities.
 *
 * @todo [TODO] Lucia will be deprecated soon and we need to implement our own authentication.
 *       See https://github.com/lucia-auth/lucia/discussions/1714 for more info.
 */
export abstract class SessionService {
	static async getUserSessions(userId: string): Promise<Session[]> {
		// Workaround as lucia interface is not strict enough.
		return (await lucia.getUserSessions(userId)) as Session[];
	}

	static async revoke(userId: string, sessionUid: string): Promise<void> {
		const allSessions = await lucia.getUserSessions(userId);
		const targetSession = allSessions.find((session) => sessionUid === session.uid);

		if (targetSession) await lucia.invalidateSession(targetSession.id);
	}

	static async revokeAll(userId: string): Promise<void> {
		await lucia.invalidateUserSessions(userId);
	}

	static async invalidate(sessionId: string): Promise<void> {
		await lucia.invalidateSession(sessionId);
	}

	// [TODO] Should validate session scope (and permissions possibly).
	static async validate(sessionId: string): Promise<{
		session: Session;
		user: User;
	} | null> {
		const authInfo = await lucia.validateSession(sessionId);
		if (!authInfo.session) {
			return null;
		}

		return {
			// Workaround as lucia interface is not strict enough.
			session: authInfo.session as Session,
			user: authInfo.user,
		};
	}

	static async create(userId: string, metadata: SessionMetadata): Promise<Session> {
		const session = await lucia.createSession(
			userId,
			{
				uid: createId(),
				scope: metadata.scope,
				metadata: metadata.metadata,
			},
			{ sessionId: createId() },
		);

		// Workaround as lucia interface is not strict enough.
		return session as Session;
	}
}
