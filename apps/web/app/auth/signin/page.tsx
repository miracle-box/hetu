import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import Link from 'next/link';
import { SigninForm } from './SigninForm';

export default function Signin() {
	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Sign In</Large>

				<SigninForm />

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
