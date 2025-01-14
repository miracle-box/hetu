import { Box, Code, Text } from '@radix-ui/themes';
import { validateSession } from '~web/libs/actions/auth';

export async function SessionInfo() {
	const session = await validateSession();

	return (
		session && (
			<Box>
				<Text>Auth Token: </Text>
				<Code>{session.authToken}</Code>
			</Box>
		)
	);
}
