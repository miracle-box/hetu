'use server';

import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
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
		return null;
	}

	const { data: renewedSession } = await api.auth.validate.post(null, {
		headers: {
			Authorization: `Bearer ${session.id}:${session.token}`,
		},
	});

	// Clear potentially invalid cookie data on failure.
	if (!renewedSession) {
		await clearSessionCookie();
		return null;
	}

	const newSessionCookie = {
		id: renewedSession.session.id,
		userId: renewedSession.session.userId,
		token: renewedSession.session.token,
		// [TODO] Workaround for Eden bug of incorrectly transforming Date object
		expiresAt: new Date(renewedSession.session.expiresAt),
	};

	await setSessionCookie(newSessionCookie);

	return newSessionCookie;
}

export const readSession = cache(async () => {
	const session = await readSessionCookie();
	// Redirect to signin page if not logged in.
	if (!session) redirect('/auth/signin');

	return {
		authToken: `${session.id}:${session.token}`,
		userId: session.userId,
		expiresAt: session.expiresAt,
	};
});

/**
 * Helper for renewing session cookie.
 *
 * * This should be called in a client component as it sets cookie for renewed sessions.
 *
 * ! **Never return session secret directly! Write it in secured cookies instead!**
 *
 * @returns Session expiry date if logged in
 */
export async function validateSession() {
	const sessionCookie = await renewSessionCookie();
	return sessionCookie?.expiresAt;
}
