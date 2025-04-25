'use server';

import 'server-only';
import { createSecretKey } from 'node:crypto';
import { SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { client as api } from '~web/libs/api/eden';

type SessionCookie = {
	id: string;
	userId: string;
	token: string;
	issuedAt: number;
	expiresAt: number;
};

export async function signSessionJwt(session: SessionCookie) {
	const key = createSecretKey(process.env.JWT_SECRET, 'utf8');

	const jwt = await new SignJWT({
		id: session.id,
		token: session.token,
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setSubject(session.userId)
		.setIssuedAt(session.issuedAt)
		.setExpirationTime(session.expiresAt)
		.sign(key);

	return jwt;
}

export async function readSessionJwt(jwt: string) {
	const key = createSecretKey(process.env.JWT_SECRET, 'utf8');
	const result = await jwtVerify(jwt, key);

	return {
		id: result.payload['id'] as string,
		userId: result.payload.sub!,
		token: result.payload['token'] as string,
		issuedAt: result.payload.iat!,
		expiresAt: result.payload.exp!,
	} satisfies SessionCookie;
}

export async function setSessionCookie(session: SessionCookie) {
	const cookieStore = await cookies();
	const cookieOpts = {
		httpOnly: true,
		secure: true,
		expires: session.expiresAt,
		sameSite: 'strict',
		path: '/',
	} as const;

	const jwtString = await signSessionJwt(session);
	cookieStore.set('session', jwtString, cookieOpts);
}

export async function clearSessionCookie() {
	const cookieStore = await cookies();

	cookieStore.delete('session');
}

export async function readSessionCookie(): Promise<SessionCookie | null> {
	const cookieStore = await cookies();

	const jwtString = cookieStore.get('session')?.value;
	if (!jwtString) return null;

	const sessionCookie = readSessionJwt(jwtString);
	return sessionCookie;
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
		expiresAt: new Date(renewedSession.session.expiresAt).getTime(),
		issuedAt: Date.now(),
	} satisfies SessionCookie;

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
	};
});

/**
 * Helper for renewing session cookie.
 *
 * * This should be called in a client component as it sets cookie for renewed sessions.
 *
 * ! **Never return session secret directly! Write it in secured cookies instead!**
 */
export async function validateSession() {
	const sessionCookie = await renewSessionCookie();

	if (!sessionCookie)
		return {
			signedIn: false,
			expiresAt: null,
		};

	return {
		signedIn: true,
		expiresAt: sessionCookie.expiresAt,
	};
}
