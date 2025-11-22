/**
 * Centralized query keys for TanStack Query.
 */

export const userMcClaims = () => ['user-mc-claims', 'me'] as const;

export const profiles = (userId?: string) => ['profiles', userId ?? 'me'] as const;

export const clientAppConfig = (buildId?: string) =>
	['clientAppConfig', buildId ?? process.env.NEXT_PUBLIC_BUILD_ID] as const;

export const sessionInfo = () => ['session-info'] as const;
