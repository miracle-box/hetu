import { Button, Container, Flex, Heading } from '@radix-ui/themes';
import { SignupForm } from '~web/app/auth/signup/SignupForm';
import Link from 'next/link';

export default function Signup() {
	return (
		<Container>
			<Flex gap="3" direction="column">
				<Heading>Sign Up</Heading>

				<SignupForm />

				<Button variant="surface" asChild>
					<Link href="/auth/signin">I already have an account</Link>
				</Button>

				<Button variant="surface" asChild>
					<Link href="/">Go back to landing page</Link>
				</Button>
			</Flex>
		</Container>
	);
}
