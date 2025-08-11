'use client';

import { Button } from '@repo/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { respToEither } from '~web/libs/utils/resp';
import { deleteClaimAction, updateClaimAction } from './actions';

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
	const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
		currentBoundProfileId || null,
	);
	const queryClient = useQueryClient();

	// 删除 McClaim
	const deleteMutation = useMutation({
		mutationFn: async (): Promise<void> => {
			const serializedResult = await deleteClaimAction(mcClaimId);
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
					throw new Error('没有权限删除此绑定');
				} else if (error.message?.includes('Unauthorized')) {
					throw new Error('认证失败，请刷新页面重新登录');
				}
				throw new Error(error.message || '删除失败');
			}
		},
		onSuccess: () => {
			// 刷新 McClaims 列表
			queryClient.invalidateQueries({ queryKey: ['user-mc-claims'] });
			// 强制重新获取数据
			queryClient.refetchQueries({ queryKey: ['user-mc-claims'] });
		},
	});

	// 更新 McClaim 绑定档案
	const updateMutation = useMutation({
		mutationFn: async (profileId: string | null): Promise<void> => {
			const serializedResult = await updateClaimAction(mcClaimId, {
				boundProfileId: profileId,
			});
			const result = respToEither(serializedResult);
			if (result.isLeft()) {
				const error = result.extract();
				// 提供更有用的错误信息
				const errorCode = error.error?.code;
				if (errorCode === 'forbidden') {
					throw new Error('没有权限修改此绑定');
				} else if (errorCode === 'profiles/not-found') {
					throw new Error('选择的档案不存在');
				} else if (error.message?.includes('Unauthorized')) {
					throw new Error('认证失败，请刷新页面重新登录');
				}
				throw new Error(error.message || '更新失败');
			}
		},
		onSuccess: () => {
			// 刷新 McClaims 列表
			queryClient.invalidateQueries({ queryKey: ['user-mc-claims'] });
			// 强制重新获取数据
			queryClient.refetchQueries({ queryKey: ['user-mc-claims'] });
		},
	});

	const handleProfileChange = (value: string) => {
		const profileId = value === 'none' ? null : value;
		setSelectedProfileId(profileId);
		updateMutation.mutate(profileId);
	};

	const handleDelete = () => {
		if (confirm(`确定要删除 ${mcUsername} 的绑定吗？此操作不可撤销。`)) {
			deleteMutation.mutate();
		}
	};

	return (
		<div className="mt-2 flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground text-sm">绑定到档案：</span>
				<select
					value={selectedProfileId || 'none'}
					onChange={(e) => handleProfileChange(e.target.value)}
					disabled={updateMutation.isPending}
					className="rounded border px-3 py-1 text-sm"
				>
					<option value="none">不绑定</option>
					{profiles.map((profile) => (
						<option key={profile.id} value={profile.id}>
							{profile.name} {profile.isPrimary && '(主档案)'}
						</option>
					))}
				</select>
				{updateMutation.isPending && (
					<span className="text-muted-foreground text-sm">更新中...</span>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="destructive"
					size="sm"
					onClick={handleDelete}
					disabled={deleteMutation.isPending}
				>
					{deleteMutation.isPending ? '删除中...' : '删除绑定'}
				</Button>
			</div>

			{/* 错误信息显示 */}
			{deleteMutation.error && (
				<div className="text-sm text-red-500">删除失败：{deleteMutation.error.message}</div>
			)}
			{updateMutation.error && (
				<div className="text-sm text-red-500">更新失败：{updateMutation.error.message}</div>
			)}
		</div>
	);
}
