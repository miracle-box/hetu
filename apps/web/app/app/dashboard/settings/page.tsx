import { Large } from '@repo/ui/typography';
import { getOauth2Metadata } from '~web/libs/actions/api/auth';
import { BindOauth2Button } from './BindOauth2Button';

export default async function Settings() {
	const providersResult = await getOauth2Metadata();
	if (providersResult.isLeft()) {
		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-2">
					<Large>Settings</Large>

					<div>Failed to load OAuth2 providers: {providersResult.extract().message}</div>
				</div>
			</main>
		);
	} else {
		const providers = providersResult.extract().providers;

		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-2">
					<Large>Settings</Large>

					<div className="flex flex-col gap-2">
						{Object.entries(providers).map(([name, metadata]) => (
							<BindOauth2Button key={name} provider={name} metadata={metadata} />
						))}
					</div>
				</div>
			</main>
		);
	}
}
