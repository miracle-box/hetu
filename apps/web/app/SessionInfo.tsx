import { Box, Code, Text } from '@radix-ui/themes';
import { validateSession } from '~web/libs/actions/auth';

export async function SessionInfo() {
	const session = await validateSession();

	return (
		session && (
			<Box>
				<Box>
					<Text>User ID: </Text>
					<Code>{session.userId}</Code>
				</Box>
				<Box>
					<Text>Auth token: </Text>
					<Code>{session.authToken}</Code>
				</Box>
			</Box>
		)
	);
}
