import { Button } from '@repo/ui/button';
import Link from 'next/link';

export function AppNav() {
	return (
		<nav className="flex gap-2">
			<Button asChild>
				<Link href="/app/dashboard">Dashboard</Link>
			</Button>
			<Button asChild>
				<Link href="/app/dashboard/profiles">Profiles</Link>
			</Button>
			<Button asChild>
				<Link href="/app/dashboard/textures">Textures</Link>
			</Button>
		</nav>
	);
}
