import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import Link from 'next/link';
import { SignupForm } from '~web/app/auth/signup/SignupForm';

export default function Signup() {
	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Sign Up</Large>

				<SignupForm />

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
