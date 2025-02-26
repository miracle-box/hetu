import { useState, useEffect } from 'react';

export const useZustandStore = <T, F>(
	store: (callback: (state: T) => unknown) => unknown,
	callback: (state: T) => F,
) => {
	const result = store(callback) as F;
	const [data, setData] = useState<F>();

	useEffect(() => {
		// Needed for using zustand in Next.js (waiting for hydration)
		// https://dev.to/abdulsamad/how-to-use-zustands-persist-middleware-in-nextjs-4lb5
		// eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
		setData(() => result);
	}, [result]);

	return data;
};
