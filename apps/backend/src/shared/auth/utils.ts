export function readBearerToken(authorizationHeader: string): string | null {
	const [authScheme, token] = authorizationHeader.split(' ') as [string, string | undefined];
	if (authScheme !== 'Bearer') {
		return null;
	}
	return token ?? null;
}

export function nowWithinDate(date: Date): boolean {
	return Date.now() < date.getTime();
}
