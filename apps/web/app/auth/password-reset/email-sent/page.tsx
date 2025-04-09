import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import Link from 'next/link';
import GoVerify from './GoVerify';

export default function EmailSent() {
	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Password Reset</Large>

				<p className="text-foreground flex justify-center text-center text-sm">
					An email has been sent to your email address with a link to reset your password.
					<br />
					Please check your inbox and follow the instructions in the email.
				</p>

				<GoVerify />

				<Button variant="secondary" asChild>
					<Link href="/">Go back to landing page</Link>
				</Button>
			</div>
		</main>
	);
}
