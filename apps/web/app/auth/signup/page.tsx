'use client';

import { Button } from '@repo/ui/button';
import { Icon } from '@repo/ui/icon';
import { Large } from '@repo/ui/typography';
import { mergeForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { respToEither } from '~web/libs/actions/resp';
import { useSignupForm, type SignupFormValues } from '~web/libs/modules/auth/forms/SignupForm';
import { handleSignup } from './actions';

export default function Signup() {
	const router = useRouter();

	const signupMutation = useMutation({
		mutationFn: handleSignup,
		onSuccess: (resp) => {
			respToEither(resp)
				.mapLeft((message) => mergeForm<SignupFormValues>(form, message))
				.ifRight(() => router.push('/'));
		},
	});

	const { form, formId, FormView } = useSignupForm({
		onSubmit: ({ value }) => signupMutation.mutate(value),
	});

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Sign Up</Large>

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
									<span>Sign Up</span>
								</>
							</Button>
						)}
					</form.Submit>
				</form.AppForm>

				<Button variant="secondary" asChild>
					<Link href="/auth/signin">I already have an account</Link>
				</Button>

				<Button variant="secondary" asChild>
					<Link href="/">Go back to landing page</Link>
				</Button>
			</div>
		</main>
	);
}
