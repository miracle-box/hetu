'use client';

import { Button } from '@repo/ui/button';
import { useCountdown } from '@repo/ui/hooks/use-countdown';
import { Icon } from '@repo/ui/icon';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { requestVerification } from '~web/libs/actions/api/auth';
import { respToEither } from '~web/libs/api/resp';

export type Props = {
	// [TODO] Share common types between frontend and backend.
	type: 'email';
	scenario: 'signup' | 'password_reset';
	getTarget: () => string;
	// [TODO] Use entire response, not just the ID.
	onVerificationRequested: (verificationId: string) => void;
	onError: (message: string) => void;
};

export function RequestVerificationButton({
	type,
	scenario,
	getTarget,
	onVerificationRequested,
	onError,
}: Props) {
	const t = useTranslations();
	const [countdown, setCountdown] = useCountdown(0);
	const requestVerificationMutation = useMutation({
		mutationFn: async (target: string) =>
			respToEither(
				await requestVerification({
					type,
					scenario,
					target,
				}),
			),
		onSuccess: (resp) =>
			resp.bimap(
				({ message }) => {
					onError(message);
				},
				({ verification }) => {
					setCountdown(60);
					onVerificationRequested(verification.id);
				},
			),
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
					{t('common.buttons.sending')}
				</>
			) : countdown > 0 ? (
				t('common.buttons.resend', { countdown })
			) : (
				t('common.buttons.sendCode')
			)}
		</Button>
	);
}
