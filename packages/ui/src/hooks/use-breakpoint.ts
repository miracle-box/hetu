import { useMediaQuery } from './use-media-query';

// ! Keep this in sync with tailwind config!
const breakpoints = {
	sm: 40,
	md: 48,
	lg: 64,
	xl: 80,
	'2xl': 96,
} as const;

/**
 * Checks whether width >= breakpoint size.
 *
 * @param breakpoint - The breakpoint to check.
 * @returns true if the current width is greater than or equal to the breakpoint.
 */
export function useBreakpoint(breakpoint: keyof typeof breakpoints) {
	return useMediaQuery(`(width >= ${breakpoints[breakpoint]}rem)`, {
		initializeWithValue: false,
	});
}
