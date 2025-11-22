'use client';

import { Large, InlineCode } from '@repo/ui/typography';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { verifyMyMcClaim, getMyMcClaims } from '~web/libs/actions/api/me';
import { ApiError } from '~web/libs/utils/api-response';
import { respToEither } from '~web/libs/utils/resp';

export function McClaimBindClient() {
	const t = useTranslations();
	const router = useRouter();
	const searchParams = useSearchParams();
	const hasProcessedRef = useRef(false);
	const [verificationId, setVerificationId] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	// 从 URL 中读取 verificationId
	useEffect(() => {
		const id = searchParams.get('verificationId');
		// eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
		setVerificationId(id);
		// eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
		setIsInitialized(true);
	}, [searchParams]);

	const verifyMutation = useMutation({
		mutationFn: async (verificationId: string) => {
			const bindResp = await verifyMyMcClaim({ verificationId });
			const bindResult = respToEither(bindResp);

			if (bindResult.isLeft()) {
				throw new ApiError(bindResult.extract());
			} else if (bindResult.isRight()) {
				const mcClaim = bindResult.extract().mcClaim;

				// 获取更新后的列表
				const listResp = await getMyMcClaims();
				const listResult = respToEither(listResp);
				const mcClaims = listResult.isRight() ? listResult.extract().mcClaims : undefined;

				return { mcClaim, mcClaims };
			}
		},
		onSuccess: () => {
			// 验证成功后清除 URL 参数
			const url = new URL(window.location.href);
			if (url.searchParams.has('verificationId')) {
				url.searchParams.delete('verificationId');
				router.replace(url.pathname + url.search, { scroll: false });
			}
		},
	});

	useEffect(() => {
		// 只有当 verificationId 存在且还没有处理过时才执行
		if (
			!verificationId ||
			hasProcessedRef.current ||
			verifyMutation.isPending ||
			verifyMutation.isSuccess ||
			verifyMutation.isError
		) {
			return;
		}
		hasProcessedRef.current = true;

		// 自动触发验证
		verifyMutation.mutate(verificationId);
	}, [verificationId, verifyMutation]);

	if (verifyMutation.isPending) {
		return (
			<div className="flex flex-col gap-4">
				<Large>{t('auth.mcClaim.bind.title')}</Large>
				<div>{t('auth.mcClaim.bind.processing')}</div>
			</div>
		);
	}

	if (verifyMutation.isError) {
		return (
			<div className="flex flex-col gap-4">
				<Large>{t('auth.mcClaim.bind.title')}</Large>
				<div>
					{t('auth.mcClaim.bind.bindFailed', {
						message: verifyMutation.error?.message || t('common.messages.unknownError'),
					})}
				</div>
			</div>
		);
	}

	if (verifyMutation.isSuccess && verifyMutation.data) {
		return (
			<div className="flex flex-col gap-4">
				<Large>{t('auth.mcClaim.bind.title')}</Large>
				<div>{t('auth.mcClaim.bind.bindSuccess')}</div>
				<pre>
					<InlineCode>{JSON.stringify(verifyMutation.data.mcClaim, null, 2)}</InlineCode>
				</pre>
				{verifyMutation.data.mcClaims && (
					<div>
						<div>{t('auth.mcClaim.bind.currentBoundProfiles')}</div>
						<pre>
							<InlineCode>
								{JSON.stringify(verifyMutation.data.mcClaims, null, 2)}
							</InlineCode>
						</pre>
					</div>
				)}
				<a className="underline" href="/app/dashboard/settings">
					{t('auth.mcClaim.bind.goBackToSettings')}
				</a>
			</div>
		);
	}

	// 还未初始化时显示加载状态
	if (!isInitialized) {
		return (
			<div className="flex flex-col gap-4">
				<Large>{t('auth.mcClaim.bind.title')}</Large>
				<div>{t('auth.mcClaim.bind.loading')}</div>
			</div>
		);
	}

	// 没有 verificationId 的情况
	if (!verificationId) {
		return (
			<div className="flex flex-col gap-4">
				<Large>{t('auth.mcClaim.bind.title')}</Large>
				<div>{t('auth.mcClaim.bind.missingParams')}</div>
				<a className="underline" href="/app/dashboard/settings">
					{t('auth.mcClaim.bind.goBackToSettings')}
				</a>
			</div>
		);
	}

	// 初始状态或等待触发
	return (
		<div className="flex flex-col gap-4">
			<Large>{t('auth.mcClaim.bind.title')}</Large>
			<div>{t('auth.mcClaim.bind.preparing')}</div>
		</div>
	);
}
