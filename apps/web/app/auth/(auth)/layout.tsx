import Image from 'next/image';
import React from 'react';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-full w-full justify-center gap-2 p-2">
			<div className="relative hidden h-full w-full overflow-clip rounded-md border shadow md:block">
				<Image
					src="https://unsplash.com/photos/Bv7IngxhD6A/download?ixid=M3wxMjA3fDB8MXxhbGx8MTR8fHx8fHx8fDE3NTgxMTIyMDZ8&force=true"
					alt="side image"
					layout="fill"
					objectFit="cover"
				/>
			</div>

			<div className="flex w-full justify-center p-2 md:max-w-1/2 md:p-4">
				<main className="flex w-full max-w-sm flex-col justify-center gap-4">
					{children}
				</main>
			</div>
		</div>
	);
}
