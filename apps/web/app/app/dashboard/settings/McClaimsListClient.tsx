'use client';

import { useQuery } from '@tanstack/react-query';
import { respToEither } from '~web/libs/utils/resp';
import { McClaimActions } from './McClaimActions';
import { getMcClaimsAction } from './actions';

interface Profile {
	id: string;
	name: string;
	isPrimary: boolean;
}

interface McClaimsListClientProps {
	initialData: { _: 'L'; _l: any } | { _: 'R'; _r: any };
	profiles: Profile[];
}

export function McClaimsListClient({ initialData, profiles }: McClaimsListClientProps) {
	// 使用初始数据并设置查询
	const {
		data: listResult,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['user-mc-claims'],
		queryFn: async () => {
			// 使用序列化安全的 action
			const serializedResult = await getMcClaimsAction();
			return respToEither(serializedResult);
		},
		initialData: respToEither(initialData),
	});

	if (isLoading) {
		return <div>加载中...</div>;
	}

	if (error || !listResult || listResult.isLeft()) {
		return (
			<div>加载失败：{listResult?.isLeft() ? listResult.extract().message : '未知错误'}</div>
		);
	}

	const { mcClaims } = listResult.extract();

	if (mcClaims.length === 0) {
		return <div>暂未绑定任何 Minecraft 档案。</div>;
	}

	return (
		<div className="flex flex-col gap-2">
			{mcClaims.map((c: any) => (
				<div key={c.id} className="rounded border p-3">
					<div className="font-medium">
						{c.mcUsername} ({c.mcUuid})
					</div>
					{c.skinTextureUrl && (
						<div className="text-muted-foreground text-sm">
							皮肤：{c.skinTextureVariant ?? 'unknown'}
						</div>
					)}
					{c.capeTextureAlias && (
						<div className="text-muted-foreground text-sm">
							披风：{c.capeTextureAlias}
						</div>
					)}
					{c.boundProfileId && (
						<div className="text-sm">绑定到本地档案：{c.boundProfileId}</div>
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
