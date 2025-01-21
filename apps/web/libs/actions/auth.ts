'use server';

import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { client as api } from '~web/libs/api/eden';

type SessionCookie = {
	id: string;
	userId: string;
	token: string;
	expiresAt: Date;
};

export async function setSessionCookie(session: SessionCookie) {
	const cookieStore = await cookies();
	const cookieOpts = {
		httpOnly: true,
		secure: true,
		expires: session.expiresAt,
		sameSite: 'lax',
		path: '/',
	} as const;

	cookieStore.set('sessionId', session.id, cookieOpts);
	cookieStore.set('sessionUserId', session.userId, cookieOpts);
	cookieStore.set('sessionToken', session.token, cookieOpts);
	cookieStore.set('sessionExpiry', session.expiresAt.getTime().toString(), cookieOpts);
}

export async function clearSessionCookie() {
	const cookieStore = await cookies();

	cookieStore.delete('sessionId');
	cookieStore.delete('sessionUserId');
	cookieStore.delete('sessionToken');
	cookieStore.delete('sessionExpiry');
}

export async function readSessionCookie(): Promise<SessionCookie | null> {
	const cookieStore = await cookies();

	const sessionId = cookieStore.get('sessionId')?.value;
	const sessionUserId = cookieStore.get('sessionUserId')?.value;
	const sessionToken = cookieStore.get('sessionToken')?.value;
	const sessionExpiry = Number(cookieStore.get('sessionExpiry')?.value);

	if (!sessionId || !sessionUserId || !sessionToken) return null;
	const expiryNumber = Number.isNaN(sessionExpiry) ? 0 : sessionExpiry;

	return {
		id: sessionId,
		userId: sessionUserId,
		token: sessionToken,
		expiresAt: new Date(expiryNumber),
	};
}

export async function renewSessionCookie() {
	const session = await readSessionCookie();
	if (!session) {
		await clearSessionCookie();
		return;
	}

	// [TODO] Make this configurable or constant (now 7 days)
	// Auto renew session if it's close to expiration
	if (Date.now() + 1000 * 3600 * 24 * 7 >= session.expiresAt.getTime()) {
		const { data: renewedSession } = await api.auth.validate.post(null, {
			headers: {
				Authorization: `Bearer ${session.id}:${session.token}`,
			},
		});
		if (!renewedSession) {
			await clearSessionCookie();
			return;
		}

		await setSessionCookie({
			id: renewedSession.session.id,
			userId: renewedSession.session.userId,
			token: renewedSession.session.token,
			// [TODO] Workaround for Eden bug of incorrectly transforming Date object
			expiresAt: new Date(renewedSession.session.expiresAt),
		});
	}
}

export const validateSession = cache(async () => {
	const session = await readSessionCookie();

	// [TODO] Probably redirect to login page
	if (!session) return null;

	return {
		authToken: `${session.id}:${session.token}`,
		userId: session.userId,
	};
});
