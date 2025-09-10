'use client';

import { Button } from '@repo/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { confirmOauth2Binding } from '~web/libs/actions/api/auth';
import { ApiError } from '~web/libs/utils/api-error';
import { respToEither } from '~web/libs/utils/resp';

export function ConfirmOauth2Binding({ verificationId }: { verificationId: string }) {
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
			Confirm Binding
		</Button>
	);
}
