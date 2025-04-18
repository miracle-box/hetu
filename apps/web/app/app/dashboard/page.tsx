import { Alert, AlertDescription, AlertTitle } from '@repo/ui/alert';
import { Large } from '@repo/ui/typography';
import { getUserInfo } from '~web/libs/actions/api';
import { AppNav } from '~web/libs/basicui/AppNav';

export default async function Dashboard() {
	const userInfo = await getUserInfo();

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Dashboard</Large>

				<AppNav />

				<Alert>
					<AlertTitle>You are logged in as</AlertTitle>

					<AlertDescription>
						{userInfo
							.map((info) => `${info.user.name} (${info.user.email})`)
							.mapLeft((message) => message)
							.extract()}
					</AlertDescription>
				</Alert>
			</div>
		</main>
	);
}
