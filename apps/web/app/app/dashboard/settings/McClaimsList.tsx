import { getUserMcClaims } from '~web/libs/actions/api';

export default async function McClaimsList() {
	const listResult = await getUserMcClaims();

	if (listResult.isLeft()) {
		return <div>加载失败：{listResult.extract().message}</div>;
	}

	const { mcClaims } = listResult.extract();

	if (mcClaims.length === 0) {
		return <div>暂未绑定任何 Minecraft 档案。</div>;
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
				</div>
			))}
		</div>
	);
}
