import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import Link from 'next/link';
import { PasswordResetForm } from './PasswordResetForm';

export default function PasswordReset() {
	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Password Reset</Large>

				<PasswordResetForm />

				<Button variant="secondary" asChild>
					<Link href="/auth/signup">I don't have an account</Link>
				</Button>

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
