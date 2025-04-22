import { useEffect, useLayoutEffect, useState } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type UseMediaQueryOptions = {
	defaultValue?: boolean;
	initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === 'undefined';

/**
 * Hook for checking if a media query matches.
 *
 * Copied from React Hooked:
 * @see https://react-hooked.vercel.app/docs/useToggle
 *
 * @param {string} query - The media query to check.
 * @param {UseMediaQueryOptions} options - Options for the hook.
 * @returns {Boolean} matches - A boolean indicating whether the media query matches.
 */
export function useMediaQuery(
	query: string,
	{ defaultValue = false, initializeWithValue = true }: UseMediaQueryOptions = {},
): boolean {
	const getMatches = (query: string): boolean => {
		if (IS_SERVER) {
			return defaultValue;
		}
		return window.matchMedia(query).matches;
	};

	const [matches, setMatches] = useState<boolean>(() => {
		if (initializeWithValue) {
			return getMatches(query);
		}
		return defaultValue;
	});

	// Handles the change event of the media query.
	function handleChange() {
		// It works and we have no plan to rewrite it so suppress the warning here.
		// eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
		setMatches(getMatches(query));
	}

	useIsomorphicLayoutEffect(() => {
		const matchMedia = window.matchMedia(query);

		// Triggered at the first client-side load and if query changes
		handleChange();

		// Use deprecated `addListener` and `removeListener` to support Safari < 14 (#135)
		if (matchMedia.addListener) {
			matchMedia.addListener(handleChange);
		} else {
			matchMedia.addEventListener('change', handleChange);
		}

		return () => {
			if (matchMedia.removeListener) {
				matchMedia.removeListener(handleChange);
			} else {
				matchMedia.removeEventListener('change', handleChange);
			}
		};
	}, [query]);

	return matches;
}
