import { Large } from '@repo/ui/typography';
import { getOauth2Metadata } from '~web/libs/actions/api/auth';
import { respToEither } from '~web/libs/utils/resp';
import { BindMcMsaButton } from './BindMcMsaButton';
import { BindOauth2Button } from './BindOauth2Button';
import McClaimsList from './McClaimsList';

// We fetch data on server side, and wants to opt-out pre-rendering.
export const dynamic = 'force-dynamic';

export default async function Settings() {
	const providersResult = respToEither(await getOauth2Metadata());
	if (providersResult.isLeft()) {
		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-4">
					<Large>Settings</Large>

					{/* OAuth2 account bindings */}
					<div className="flex flex-col gap-2">
						<div>
							Failed to load OAuth2 providers: {providersResult.extract().message}
						</div>
					</div>

					{/* Mojang Verification */}
					<section className="flex flex-col gap-2">
						<Large>Mojang 正版验证</Large>
						<BindMcMsaButton />
						<McClaimsList />
					</section>
				</div>
			</main>
		);
	} else if (providersResult.isRight()) {
		const providers = providersResult.extract().providers;

		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-4">
					<Large>Settings</Large>

					{/* OAuth2 account bindings */}
					<section className="flex flex-col gap-2">
						{providers &&
							Object.entries(providers).map(([name, metadata]) => (
								<BindOauth2Button key={name} provider={name} metadata={metadata} />
							))}
						{!providers && <div>No OAuth2 providers configured.</div>}
					</section>

					{/* Mojang Verification */}
					<section className="flex flex-col gap-2">
						<Large>Mojang 正版验证</Large>
						<BindMcMsaButton />
						<McClaimsList />
					</section>
				</div>
			</main>
		);
	}
}
