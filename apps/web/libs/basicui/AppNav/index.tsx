import { Button, Flex } from '@radix-ui/themes';
import Link from 'next/link';

export function AppNav() {
	return (
		<Flex gap="3">
			<Button asChild>
				<Link href="/app/dashboard">Dashboard</Link>
			</Button>
			<Button asChild>
				<Link href="/app/dashboard/profiles">Profiles</Link>
			</Button>
			<Button asChild>
				<Link href="/app/dashboard/textures">Textures</Link>
			</Button>
		</Flex>
	);
}
