import { Large } from '@repo/ui/typography';
import { Suspense } from 'react';
import { McClaimBindClient } from './McClaimBindClient';

export default function McClaimBind() {
	return (
		<main className="container mx-auto">
			<Suspense
				fallback={
					<div className="flex flex-col gap-4">
						<Large>Mojang 正版验证</Large>
						<div>加载中...</div>
					</div>
				}
			>
				<McClaimBindClient />
			</Suspense>
		</main>
	);
}
