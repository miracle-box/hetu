import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import Link from 'next/link';
import { inspectVerification, verifyResetVerification } from './actions';
import { NewPasswordForm } from './NewPasswordForm';

type SearchParams = Promise<{ id?: string; secret?: string }>;

export default async function Verified({ searchParams }: { searchParams: SearchParams }) {
	const { id, secret } = await searchParams;

	if (!id || !secret) {
		return <ThisPageLayout>Invalid verification link</ThisPageLayout>;
	}

	const verif = await inspectVerification(id);
	if (!verif) {
		return <ThisPageLayout>Verification link expired</ThisPageLayout>;
	}

	if (!verif.verification.verified) {
		const verified = await verifyResetVerification(id, secret);
		if (!verified) {
			return <ThisPageLayout>Failed to verify your request</ThisPageLayout>;
		}
	}

	return (
		<ThisPageLayout>
			<NewPasswordForm verificationId={id} />
		</ThisPageLayout>
	);
}

function ThisPageLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Password Reset</Large>

				<div className="text-foreground flex text-sm">{children}</div>

				<Button variant="secondary" asChild>
					<Link href="/">Go back to landing page</Link>
				</Button>
			</div>
		</main>
	);
}
