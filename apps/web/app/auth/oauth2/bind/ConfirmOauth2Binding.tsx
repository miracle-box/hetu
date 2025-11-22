'use client';

import { Button } from '@repo/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { confirmOauth2Binding } from '~web/libs/actions/api/auth';
import { respToEither } from '~web/libs/api/resp';
import { ApiError } from '~web/libs/api/response';

export function ConfirmOauth2Binding({ verificationId }: { verificationId: string }) {
	const t = useTranslations();
	const router = useRouter();

	const confirmOauth2BindingMutation = useMutation({
		mutationFn: async (verificationId: string) =>
			respToEither(await confirmOauth2Binding({ verificationId }))
				.mapLeft((error) => Promise.reject(new ApiError(error)))
				.extract(),
		onSuccess: () => {
			router.push('/');
		},
	});

	return (
		<Button onClick={() => confirmOauth2BindingMutation.mutate(verificationId)}>
			{t('common.buttons.confirmBinding')}
		</Button>
	);
}
