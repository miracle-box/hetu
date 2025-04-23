'use client';

import { Button } from '@repo/ui/button';
import { Icon } from '@repo/ui/icon';
import { Large } from '@repo/ui/typography';
import { mergeForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { respToEither } from '~web/libs/utils/resp';
import { useSigninForm, type SigninFormValues } from '~web/libs/modules/auth/forms/SigninForm';
import { handleSignin } from './actions';

export default function Signin() {
	const router = useRouter();

	const signinMutation = useMutation({
		mutationFn: handleSignin,
		onSuccess: (resp) => {
			respToEither(resp)
				.mapLeft((message) => mergeForm<SigninFormValues>(form, message))
				.ifRight(() => router.push('/'));
		},
	});

	const { form, formId, FormView } = useSigninForm({
		onSubmit: ({ value }) => signinMutation.mutate(value),
	});

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Sign In</Large>

				<FormView />
				<form.AppForm>
					<form.Submit>
						{(canSubmit, isSubmitting) => (
							<Button
								type="submit"
								form={formId}
								className="w-full"
								disabled={!canSubmit}
							>
								<>
									{isSubmitting && (
										<Icon.Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									<span>Sign In</span>
								</>
							</Button>
						)}
					</form.Submit>
				</form.AppForm>

				<Button variant="secondary" asChild>
					<Link href="/auth/signup">I don't have an account</Link>
				</Button>

				<Button variant="secondary" asChild>
					<Link href="/auth/password-reset">I have forgotten my details</Link>
				</Button>

				<Button variant="secondary" asChild>
					<Link href="/">Go back to landing page</Link>
				</Button>
			</div>
		</main>
	);
}
