import { Callout, Container, Flex, Heading } from '@radix-ui/themes';
import { getUserInfo } from '~web/libs/actions/api';
import { AppNav } from '~web/libs/basicui/AppNav';

export default async function Dashboard() {
	const userInfo = await getUserInfo();

	return (
		<Container>
			<Flex gap="3" direction="column">
				<Heading>Dashboard</Heading>

				<AppNav />

				<Callout.Root>
					<Heading as="h3" size="3">
						You are logged in as
					</Heading>

					{userInfo && `${userInfo?.name} (${userInfo?.email})`}
				</Callout.Root>
			</Flex>
		</Container>
	);
}
