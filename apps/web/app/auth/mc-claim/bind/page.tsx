import { Large, InlineCode } from '@repo/ui/typography';
import { verifyUserMcClaim, getUserMcClaims } from '~web/libs/actions/api';

export type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function McClaimBind({ searchParams }: Props) {
	const search = await searchParams;
	const verificationId =
		typeof search['verificationId'] === 'string' ? search['verificationId'] : undefined;

	if (!verificationId) {
		return <div>Invalid verification ID</div>;
	}

	const bindResult = await verifyUserMcClaim({ verificationId });

	if (bindResult.isLeft()) {
		return (
			<main className="container mx-auto">
				<div className="flex flex-col gap-4">
					<Large>Mojang 正版验证</Large>
					<div>绑定失败：{bindResult.extract().message}</div>
				</div>
			</main>
		);
	}

	const mcClaim = bindResult.extract().mcClaim;

	// Optionally fetch the updated list to show
	const listResult = await getUserMcClaims();

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-4">
				<Large>Mojang 正版验证</Large>
				<div>绑定成功，以下是绑定的档案信息：</div>
				<pre>
					<InlineCode>{JSON.stringify(mcClaim, null, 2)}</InlineCode>
				</pre>
				{listResult.isRight() && (
					<div>
						<div>当前已绑定档案：</div>
						<pre>
							<InlineCode>
								{JSON.stringify(listResult.extract().mcClaims, null, 2)}
							</InlineCode>
						</pre>
					</div>
				)}
				<a className="underline" href="/app/dashboard/settings">
					返回设置页面
				</a>
			</div>
		</main>
	);
}
