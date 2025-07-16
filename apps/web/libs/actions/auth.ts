'use server';

import 'server-only';
import { SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EitherAsync } from 'purify-ts/EitherAsync';
import { cache } from 'react';
import { refreshSession, renewSession } from './api';
import { ServerAppConfig } from '../utils/app-config/server';

// [TODO] Use type from backend instead.
type Session = {
	id: string;
	userId: string;
	token: string;
	createdAt: Date;
	updatedAt: Date;
};

type SessionCookie = {
	id: string;
	userId: string;
	token: string;
	createdAt: number;
	updatedAt: number;
};

export async function signSessionJwt(session: SessionCookie): Promise<string> {
	const secret = new TextEncoder().encode(ServerAppConfig.jwtSecret);

	const jwt = await new SignJWT({
		id: session.id,
		token: session.token,
		createdAt: session.createdAt,
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setSubject(session.userId)
		.setIssuedAt(session.updatedAt)
		// [TODO] Expiration time should be configurable (30d after creation time now)
		.setExpirationTime(session.createdAt + 30 * 24 * 3600 * 1000)
		.sign(secret);

	return jwt;
}

export async function readSessionJwt(jwt: string): Promise<SessionCookie> {
	const secret = new TextEncoder().encode(ServerAppConfig.jwtSecret);
	const result = await jwtVerify(jwt, secret);

	return {
		id: result.payload['id'] as string,
		userId: result.payload.sub!,
		token: result.payload['token'] as string,
		createdAt: result.payload['createdAt'] as number,
		updatedAt: result.payload.iat!,
	} satisfies SessionCookie;
}

export async function writeSessionCookie(session: SessionCookie) {
	const cookieStore = await cookies();
	const cookieOpts = {
		httpOnly: true,
		secure: true,
		// [TODO] Expiration time should be configurable (30d after creation time now)
		expires: session.createdAt + 30 * 24 * 3600 * 1000,
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

/**
 * [FIXME] Workaround for Eden bug of incorrectly transforming Date object
 */
export async function sessionToCookie(session: Session) {
	return Promise.resolve({
		id: session.id,
		userId: session.userId,
		token: session.token,
		createdAt: new Date(session.createdAt).getTime(),
		updatedAt: new Date(session.updatedAt).getTime(),
	});
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
	const session = await readSessionCookie();
	if (!session) return { signedIn: false };

	const now = Date.now();
	const authToken = `${session.id}:${session.token}`;

	// [TODO] Make these time spans configurable
	// Renew session every hour.
	if (now - session.updatedAt > 3600 * 1000) {
		const renewRequest = EitherAsync.fromPromise(() => renewSession(authToken))
			.map(({ session }) => sessionToCookie(session))
			.map((session) => writeSessionCookie(session))
			.mapLeft(() => clearSessionCookie());

		const result = await renewRequest.run();
		if (result.isLeft()) return { signedIn: false };
	}

	// Refresh session every day
	if (now - session.createdAt > 24 * 3600 * 1000) {
		const refreshRequest = EitherAsync.fromPromise(() => refreshSession(authToken))
			.map(({ session }) => sessionToCookie(session))
			.map((session) => writeSessionCookie(session))
			.mapLeft(() => clearSessionCookie());

		const result = await refreshRequest.run();
		if (result.isLeft()) return { signedIn: false };
	}

	return { signedIn: true };
}
