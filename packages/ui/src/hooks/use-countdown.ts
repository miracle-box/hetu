import { useState, useEffect } from 'react';

export function useCountdown(initialCount: number) {
	const [countdown, setCountdown] = useState(initialCount);

	useEffect(() => {
		if (countdown <= 0) return;
		const timer = setInterval(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [countdown]);

	return [countdown, setCountdown] as const;
}
