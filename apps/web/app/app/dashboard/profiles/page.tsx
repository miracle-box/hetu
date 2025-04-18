import { cn } from '@repo/ui';
import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import { getUserProfiles } from '~web/libs/actions/api';
import { AppNav } from '~web/libs/basicui/AppNav';
import { ProfileCard } from '~web/libs/basicui/ProfileCard';
import CreateProfileDialog from './CreateProfileDialog';

export default async function Profiles() {
	const profilesResp = await getUserProfiles();

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Profiles</Large>

				<AppNav />

				<CreateProfileDialog>
					<Button>Create profile</Button>
				</CreateProfileDialog>

				{profilesResp
					.bimap(
						(message) => <span>{message}</span>,

						({ profiles }) => (
							<div
								className={cn(
									'grid grid-flow-row grid-cols-1 gap-2',
									'md:grid-cols-2',
									'xl:grid-cols-3',
								)}
							>
								{profiles.length > 0 ? (
									profiles.map((profile) => (
										<ProfileCard key={profile.id} profile={profile} />
									))
								) : (
									<span>No profiles</span>
								)}
							</div>
						),
					)
					.extract()}
			</div>
		</main>
	);
}
