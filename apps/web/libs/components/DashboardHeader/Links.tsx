import { Button } from '@repo/ui/button';
import Link from 'next/link';

const navLinks = [
	{ href: 'https://github.com/miracle-box/hetu/issues', label: 'Feedback' },
	{ href: 'https://github.com/miracle-box/hetu', label: 'GitHub' },
] as const;

export function Links() {
	return (
		<div className="flex items-center">
			{navLinks.map((item) => (
				<Button variant="link" className="text-muted-foreground" key={item.href} asChild>
					<Link href={item.href}>{item.label}</Link>
				</Button>
			))}
		</div>
	);
}
