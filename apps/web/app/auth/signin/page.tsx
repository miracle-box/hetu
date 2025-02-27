import { Button, Container, Flex, Heading } from '@radix-ui/themes';
import Link from 'next/link';
import { SigninForm } from './SigninForm';

export default function Signin() {
	return (
		<Container>
			<Flex gap="3" direction="column">
				<Heading>Sign In</Heading>

				<SigninForm />

				<Button variant="surface" asChild>
					<Link href="/auth/signup">I don't have an account</Link>
				</Button>

				<Button variant="surface" asChild>
					<Link href="/">Go back to landing page</Link>
				</Button>
			</Flex>
		</Container>
	);
}
