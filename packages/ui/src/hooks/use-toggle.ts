import { useReducer } from 'react';

/**
 * Toggle between a set of options.
 *
 * Copied from Mantine.
 * @see https://github.com/mantinedev/mantine/blob/master/packages/%40mantine/hooks/src/use-toggle/use-toggle.ts
 *
 * @param options options to cycle through
 * @returns a tuple of [current option, function to toggle the option]
 */
export function useToggle<T = boolean>(options: T[] = [false, true] as T[]) {
	if (options.length <= 0) {
		throw new Error('Options must have at least one element');
	}

	const [[option], toggle] = useReducer((state: T[], action: React.SetStateAction<T>) => {
		// state length checked above.
		const value = action instanceof Function ? action(state[0]!) : action;
		const index = Math.abs(state.indexOf(value));

		return state.slice(index).concat(state.slice(0, index));
	}, options);

	return [option, toggle as (value?: React.SetStateAction<T>) => void] as const;
}
