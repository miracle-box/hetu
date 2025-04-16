'use client';

import { Button } from '@repo/ui/button';
import { useCountdown } from '@repo/ui/hooks/use-countdown';
import { Icon } from '@repo/ui/icon';
import { useMutation } from '@tanstack/react-query';
import { requestVerification } from '~web/libs/actions/api';

export type Props = {
	// [TODO] Share common types between frontend and backend.
	type: 'email';
	scenario: 'signup' | 'password_reset';
	getTarget: () => string;
	// [TODO] Use entire response, not just the ID.
	onVerificationRequested: (verificationId: string) => void;
};

export function RequestVerificationButton({
	type,
	scenario,
	getTarget,
	onVerificationRequested,
}: Props) {
	const [countdown, setCountdown] = useCountdown(0);
	const requestVerificationMutation = useMutation({
		mutationFn: (target: string) =>
			requestVerification({
				type,
				scenario,
				target,
			}),
		onSuccess: (data) =>
			data
				.map(({ verification }) => {
					setCountdown(60);
					onVerificationRequested(verification.id);
				})
				.mapLeft((message) => {
					// [TODO] Notify user about the error!
					void message;
				}),
	});

	const handleSendCode = () => {
		const target = getTarget();
		requestVerificationMutation.mutate(target);
	};

	return (
		<Button
			onClick={handleSendCode}
			disabled={requestVerificationMutation.isPending || countdown > 0}
		>
			{requestVerificationMutation.isPending ? (
				<>
					<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Sending...
				</>
			) : countdown > 0 ? (
				`Resend (${countdown}s)`
			) : (
				'Send Code'
			)}
		</Button>
	);
}
