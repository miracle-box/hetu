import { Button, Container, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { AppNav } from '~web/libs/basicui/AppNav';
import { getUserProfiles } from '~web/libs/actions/api';
import { ProfileCard } from '~web/libs/basicui/ProfileCard';
import CreateProfileDialog from './CreateProfileDialog';

export default async function Profiles() {
	const profiles = await getUserProfiles();

	return (
		<Container>
			<Flex gap="3" direction="column">
				<Heading>Profiles</Heading>

				<AppNav />

				<CreateProfileDialog>
					<Button>Create profile</Button>
				</CreateProfileDialog>

				<Grid columns={{ xs: '1', sm: '2', lg: '3' }} gap="3">
					{profiles &&
						profiles.map((profile) => (
							<ProfileCard key={profile.id} profile={profile} />
						))}
				</Grid>

				{profiles && profiles.length <= 0 && <Text>No profiles</Text>}
			</Flex>
		</Container>
	);
}
