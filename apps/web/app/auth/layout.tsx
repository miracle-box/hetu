import React from 'react';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-full w-full p-6">
			<div className="bg-card flex-1 rounded-2xl border">{children}</div>
		</div>
	);
}
