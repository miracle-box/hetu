import { Badge, Card, Code, Container, DataList, Flex, Heading, Text } from '@radix-ui/themes';
import { AppNav } from '~web/libs/basicui/AppNav';
import { getUserProfiles } from '~web/libs/actions/api';

export default async function Profiles() {
	const profiles = await getUserProfiles();

	return (
		<Container>
			<Flex gap="3" direction="column">
				<Heading>Profiles</Heading>

				<AppNav />

				{profiles &&
					profiles.map((profile) => (
						<Card key={profile.id}>
							<DataList.Root>
								<DataList.Item>
									<DataList.Label>Username</DataList.Label>
									<DataList.Value>{profile.name}</DataList.Value>
								</DataList.Item>
								<DataList.Item>
									<DataList.Label>UUID</DataList.Label>
									<DataList.Value>
										<Code>{profile.id}</Code>
									</DataList.Value>
								</DataList.Item>
								<DataList.Item>
									<DataList.Label>Primary Profile</DataList.Label>
									<DataList.Value>
										{profile.isPrimary ? (
											<Badge color="green">Primary</Badge>
										) : (
											<Badge color="gray">Not Primary</Badge>
										)}
									</DataList.Value>
								</DataList.Item>
							</DataList.Root>
						</Card>
					))}

				{profiles && profiles.length <= 0 && <Text>No profiles</Text>}
			</Flex>
		</Container>
	);
}
