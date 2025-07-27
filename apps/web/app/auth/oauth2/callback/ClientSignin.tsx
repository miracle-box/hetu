'use client';

import { Icon } from '@repo/ui/icon';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ApiError } from '~web/libs/utils/api-error';
import { respToEither } from '~web/libs/utils/resp';
import { handleOAuth2Signin } from './actions';

export function ClientSignin({ verificationId }: { verificationId: string }) {
	const router = useRouter();
	const hasExecuted = useRef(false);

	const signinMutation = useMutation({
		mutationFn: (verificationId: string) =>
			handleOAuth2Signin({ verificationId }).then((resp) =>
				respToEither(resp)
					.mapLeft((error) => Promise.reject(new ApiError(error)))
					.extract(),
			),
		onSuccess: () => {
			// Cookie has been set, redirect to the app
			router.push('/');
		},
	});

	useEffect(() => {
		// Execute signin mutation when component mounts, but only once
		if (!hasExecuted.current) {
			hasExecuted.current = true;
			signinMutation.mutate(verificationId);
		}
	}, [verificationId, signinMutation]);

	if (signinMutation.isPending) {
		return (
			<div className="flex items-center gap-2">
				<Icon.Loader2 className="h-4 w-4 animate-spin" />
				<span>Signing you in...</span>
			</div>
		);
	}

	if (signinMutation.isError) {
		return (
			<div className="flex flex-col gap-2">
				<div className="flex gap-2">
					<div>Signin failed: </div>
					<div>{signinMutation.error?.message || 'Unknown error'}</div>
				</div>
			</div>
		);
	}

	// Success state - this should not be visible for long due to redirect
	return (
		<div className="flex items-center gap-2">
			<Icon.CheckCircle className="h-4 w-4 text-green-500" />
			<span>Sign in successful! Redirecting...</span>
		</div>
	);
}
