import { Container, Flex, Heading } from '@radix-ui/themes';
import { SigninForm } from './SigninForm';

export default function Signin() {
	return (
		<Container>
			<Flex gap="3" direction="column">
				<Heading>Sign In</Heading>

				<SigninForm />
			</Flex>
		</Container>
	);
}
