import { Alert, AlertDescription, AlertTitle } from '@repo/ui/alert';
import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import Link from 'next/link';
import { SessionInfo } from './SessionInfo';
export default function Home() {
	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Hetu Web</Large>

				<div className="flex gap-2">
					<Button asChild>
						<Link href="/auth/signin">Sign In</Link>
					</Button>
					<Button asChild>
						<Link href="/auth/signup">Sign Up</Link>
					</Button>
					<Button asChild>
						<Link href="/app/dashboard">App</Link>
					</Button>
				</div>

				<Alert>
					<AlertTitle>Running on</AlertTitle>
					<AlertDescription>
						<div className="flex flex-col">
							<span>Bun {typeof Bun !== 'undefined' ? Bun.version : '×'}</span>
							<span>
								Node.js {typeof process !== 'undefined' ? process.version : '×'}
							</span>
						</div>
					</AlertDescription>
				</Alert>

				<Alert>
					<AlertTitle>Session info</AlertTitle>

					<AlertDescription>
						<SessionInfo />
					</AlertDescription>
				</Alert>
			</div>
		</main>
	);
}
