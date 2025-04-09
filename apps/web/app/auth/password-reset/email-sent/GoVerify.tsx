'use client';

import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function GoVerify() {
	const router = useRouter();
	const [verificationId, setVerificationId] = React.useState('');
	const [secret, setSecret] = React.useState('');

	return (
		<div className="flex flex-col gap-2">
			<Input
				placeholder="Verification ID"
				value={verificationId}
				onChange={(e) => {
					setVerificationId(e.target.value);
				}}
			/>
			<Input
				placeholder="Secret"
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
				Verify
			</Button>
		</div>
	);
}
