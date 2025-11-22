'use client';

import { Button } from '@repo/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { deleteMyMcClaim, updateMyMcClaim } from '~web/libs/actions/api/me';
import { respToEither } from '~web/libs/utils/resp';

interface Profile {
	id: string;
	name: string;
	isPrimary: boolean;
}

interface McClaimActionsProps {
	mcClaimId: string;
	currentBoundProfileId?: string | null;
	mcUsername: string;
	profiles: Profile[];
}

export function McClaimActions({
	mcClaimId,
	currentBoundProfileId,
	mcUsername,
	profiles,
}: McClaimActionsProps) {
	const t = useTranslations();
	const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
		currentBoundProfileId || null,
	);
	const queryClient = useQueryClient();

	// 删除 McClaim
	const deleteMutation = useMutation({
		mutationFn: async (): Promise<void> => {
			const serializedResult = await deleteMyMcClaim({ mcClaimId });
			const result = respToEither(serializedResult);
			if (result.isLeft()) {
				const error = result.extract();
				const errorCode = error.error?.code;

				// 如果是 "not found" 错误，说明已经被删除了，静默处理
				if (errorCode === 'users/mc-claim-not-found') {
					console.log('McClaim already deleted, refreshing list...');
					return; // 不抛出错误，让 onSuccess 处理刷新
				}

				// 提供更有用的错误信息
				if (errorCode === 'forbidden') {
					throw new Error(t('dashboard.settings.page.mcClaim.noPermissionDelete'));
				} else if (error.message?.includes('Unauthorized')) {
					throw new Error(t('common.messages.authenticationFailed'));
				}
				throw new Error(error.message || t('common.messages.deleteFailed'));
			}
		},
		onSuccess: () => {
			// 刷新 McClaims 列表
			void queryClient.invalidateQueries({ queryKey: ['user-mc-claims'] });
			// 强制重新获取数据
			void queryClient.refetchQueries({ queryKey: ['user-mc-claims'] });
		},
	});

	// 更新 McClaim 绑定档案
	const updateMutation = useMutation({
		mutationFn: async (profileId: string | null): Promise<void> => {
			const serializedResult = await updateMyMcClaim(
				{ mcClaimId },
				{
					boundProfileId: profileId,
				},
			);
			const result = respToEither(serializedResult);
			if (result.isLeft()) {
				const error = result.extract();
				// 提供更有用的错误信息
				const errorCode = error.error?.code;
				if (errorCode === 'forbidden') {
					throw new Error(t('dashboard.settings.page.mcClaim.noPermissionUpdate'));
				} else if (errorCode === 'profiles/not-found') {
					throw new Error(t('dashboard.settings.page.mcClaim.profileNotFound'));
				} else if (error.message?.includes('Unauthorized')) {
					throw new Error(t('common.messages.authenticationFailed'));
				}
				throw new Error(error.message || t('common.messages.updateFailed'));
			}
		},
		onSuccess: () => {
			// 刷新 McClaims 列表
			void queryClient.invalidateQueries({ queryKey: ['user-mc-claims'] });
			// 强制重新获取数据
			void queryClient.refetchQueries({ queryKey: ['user-mc-claims'] });
		},
	});

	const handleProfileChange = (value: string) => {
		const profileId = value === 'none' ? null : value;
		setSelectedProfileId(profileId);
		updateMutation.mutate(profileId);
	};

	const handleDelete = () => {
		if (confirm(t('dashboard.settings.page.mcClaim.confirmDelete', { username: mcUsername }))) {
			deleteMutation.mutate();
		}
	};

	return (
		<div className="mt-2 flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground text-sm">
					{t('dashboard.settings.page.mcClaim.bindToProfile')}
				</span>
				<select
					value={selectedProfileId || 'none'}
					onChange={(e) => handleProfileChange(e.target.value)}
					disabled={updateMutation.isPending}
					className="rounded border px-3 py-1 text-sm"
				>
					<option value="none">{t('dashboard.settings.page.mcClaim.notBound')}</option>
					{profiles.map((profile) => (
						<option key={profile.id} value={profile.id}>
							{profile.name}{' '}
							{profile.isPrimary &&
								t('dashboard.settings.page.mcClaim.primaryProfile')}
						</option>
					))}
				</select>
				{updateMutation.isPending && (
					<span className="text-muted-foreground text-sm">
						{t('dashboard.settings.page.mcClaim.updating')}
					</span>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="destructive"
					size="sm"
					onClick={handleDelete}
					disabled={deleteMutation.isPending}
				>
					{deleteMutation.isPending
						? t('dashboard.settings.page.mcClaim.deleting')
						: t('dashboard.settings.page.mcClaim.deleteBinding')}
				</Button>
			</div>

			{deleteMutation.error && (
				<div className="text-sm text-red-500">
					{t('common.messages.deleteFailed')}: {deleteMutation.error.message}
				</div>
			)}
			{updateMutation.error && (
				<div className="text-sm text-red-500">
					{t('common.messages.updateFailed')}: {updateMutation.error.message}
				</div>
			)}
		</div>
	);
}
