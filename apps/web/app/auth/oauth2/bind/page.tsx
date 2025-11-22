import { InlineCode } from '@repo/ui/typography';
import { getTranslations } from 'next-intl/server';
import { inspectOauth2Binding } from '#/libs/actions/api/auth';
import { respToEither } from '#/libs/api/resp';
import { ConfirmOauth2Binding } from './ConfirmOauth2Binding';

export type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OAuthBind({ searchParams }: Props) {
	const t = await getTranslations();
	const search = await searchParams;
	if (typeof search['verificationId'] !== 'string') {
		return <div>{t('auth.oauth2.bind.invalidVerificationId')}</div>;
	}
	const verificationId = search['verificationId'];
	const inspectResponse = respToEither(
		await inspectOauth2Binding({
			verificationId,
		}),
	);

	if (inspectResponse.isLeft()) {
		return (
			<div>
				{t('auth.oauth2.bind.inspectFailed', {
					message: inspectResponse.extract().message,
				})}
			</div>
		);
	} else if (inspectResponse.isRight()) {
		const { user, provider, oauth2Profile, alreadyBound } = inspectResponse.extract();
		return (
			<div>
				<div>{t('auth.oauth2.bind.user', { name: user.name })}</div>
				<div>
					<div>{t('auth.oauth2.bind.oauth2Profile')}</div>
					<pre>
						<InlineCode>{JSON.stringify(oauth2Profile, null, 2)}</InlineCode>
					</pre>
				</div>
				<div>
					{t('auth.oauth2.bind.alreadyBound', {
						status: alreadyBound ? t('auth.oauth2.bind.yes') : t('auth.oauth2.bind.no'),
					})}
				</div>

				{alreadyBound ? (
					<div>
						{t('auth.oauth2.bind.alreadyBoundMessage', {
							provider,
							id: oauth2Profile.id,
						})}
					</div>
				) : (
					<div>
						<div>
							{t('auth.oauth2.bind.bindingMessage', {
								provider,
								id: oauth2Profile.id,
							})}
						</div>
						<ConfirmOauth2Binding verificationId={verificationId} />
					</div>
				)}
			</div>
		);
	}
}
