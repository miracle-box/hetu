import { InlineCode } from '@repo/ui/typography';
import { inspectOauth2Binding } from '~web/libs/actions/api/auth';
import { respToEither } from '~web/libs/utils/resp';
import { ConfirmOauth2Binding } from './ConfirmOauth2Binding';

export type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OAuthBind({ searchParams }: Props) {
	const search = await searchParams;
	if (typeof search['verificationId'] !== 'string') {
		return <div>Invalid verification ID</div>;
	}
	const verificationId = search['verificationId'];
	const inspectResponse = respToEither(
		await inspectOauth2Binding({
			verificationId,
		}),
	);

	if (inspectResponse.isLeft()) {
		return <div>Failed to inspect binding: {inspectResponse.extract().message}</div>;
	} else if (inspectResponse.isRight()) {
		const { user, provider, oauth2Profile, alreadyBound } = inspectResponse.extract();
		return (
			<div>
				<div>User: {user.name}</div>
				<div>
					<div>OAuth2 Profile: </div>
					<pre>
						<InlineCode>{JSON.stringify(oauth2Profile, null, 2)}</InlineCode>
					</pre>
				</div>
				<div>Already bound: {alreadyBound ? 'Yes' : 'No'}</div>

				{alreadyBound ? (
					<div>
						You have already bound [{provider}] account {oauth2Profile.id} to your
						account.
					</div>
				) : (
					<div>
						<div>
							You are binding [{provider}] account {oauth2Profile.id} to your account.
						</div>
						<ConfirmOauth2Binding verificationId={verificationId} />
					</div>
				)}
			</div>
		);
	}
}
