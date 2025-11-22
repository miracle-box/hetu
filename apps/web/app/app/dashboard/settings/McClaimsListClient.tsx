'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { getUserMcClaims } from '~web/libs/actions/api';
import { respToEither } from '~web/libs/utils/resp';
import { McClaimActions } from './McClaimActions';

interface Profile {
	id: string;
	name: string;
	isPrimary: boolean;
}

interface McClaimsListClientProps {
	initialData: Awaited<ReturnType<typeof getUserMcClaims>>;
	profiles: Profile[];
}

export function McClaimsListClient({ initialData, profiles }: McClaimsListClientProps) {
	const t = useTranslations();
	// 使用初始数据并设置查询
	const {
		data: listResult,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['user-mc-claims'],
		queryFn: async () => respToEither(await getUserMcClaims()),
		initialData: respToEither(initialData),
	});

	if (isLoading) {
		return <div>{t('dashboard.settings.page.mcClaim.loading')}</div>;
	}

	if (error || !listResult || listResult.isLeft() || !listResult.isRight()) {
		return (
			<div>
				{t('dashboard.settings.page.mcClaim.loadFailed')}
				{listResult?.isLeft()
					? listResult.extract().message
					: t('common.messages.unknownError')}
			</div>
		);
	}

	const { mcClaims } = listResult.extract();

	if (mcClaims.length === 0) {
		return <div>{t('dashboard.settings.page.mcClaim.noClaims')}</div>;
	}

	return (
		<div className="flex flex-col gap-2">
			{mcClaims.map((c) => (
				<div key={c.id} className="rounded border p-3">
					<div className="font-medium">
						{c.mcUsername} ({c.mcUuid})
					</div>
					{c.skinTextureUrl && (
						<div className="text-muted-foreground text-sm">
							{t('dashboard.settings.page.mcClaim.skinTexture')}
							{c.skinTextureVariant ?? 'unknown'}
						</div>
					)}
					{c.capeTextureAlias && (
						<div className="text-muted-foreground text-sm">
							{t('dashboard.settings.page.mcClaim.capeTexture')}
							{c.capeTextureAlias}
						</div>
					)}
					{c.boundProfileId && (
						<div className="text-sm">
							{t('dashboard.settings.page.mcClaim.boundToLocalProfile')}
							{c.boundProfileId}
						</div>
					)}
					<McClaimActions
						mcClaimId={c.id}
						currentBoundProfileId={c.boundProfileId}
						mcUsername={c.mcUsername}
						profiles={profiles}
					/>
				</div>
			))}
		</div>
	);
}
