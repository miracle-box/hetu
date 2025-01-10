import { Button, Callout, Container, Flex, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { SessionInfo } from './SessionInfo';

export default function Home() {
	return (
		<Container>
			<Flex gap="3" direction="column">
				<Heading>Hetu Web</Heading>

				<Callout.Root>
					<Heading as="h3" size="3">
						Running on
					</Heading>
					<Flex direction="column">
						<Text>Bun {typeof Bun !== 'undefined' ? Bun.version : '×'}</Text>
						<Text>
							Node.js {typeof process !== 'undefined' ? process.version : '×'}
						</Text>
					</Flex>
				</Callout.Root>

				<Callout.Root>
					<Heading as="h3" size="3">
						Session Info
					</Heading>

					<SessionInfo />
				</Callout.Root>

				<Flex gap="3">
					<Button asChild>
						<Link href="/auth/signin">Sign In</Link>
					</Button>
					<Button>Sign Up</Button>
				</Flex>
			</Flex>
		</Container>
	);
}
