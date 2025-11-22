'use client';

import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function GoVerify() {
	const t = useTranslations();
	const router = useRouter();
	const [verificationId, setVerificationId] = React.useState('');
	const [secret, setSecret] = React.useState('');

	return (
		<div className="flex flex-col gap-2">
			<Input
				placeholder={t('common.placeholders.verificationId')}
				value={verificationId}
				onChange={(e) => {
					setVerificationId(e.target.value);
				}}
			/>
			<Input
				placeholder={t('common.placeholders.secret')}
				value={secret}
				onChange={(e) => {
					setSecret(e.target.value);
				}}
			/>
			<Button
				variant="default"
				onClick={() => {
					router.push(
						`/auth/password-reset/verified?id=${verificationId}&secret=${secret}`,
					);
				}}
			>
				{t('common.buttons.verify')}
			</Button>
		</div>
	);
}
