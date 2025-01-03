import { Button } from '@radix-ui/themes';

export default function Home() {
	return (
		<div>
			<div>Bun {typeof Bun !== 'undefined' ? Bun.version : '×'}</div>
			<div>Node.js {typeof process !== 'undefined' ? process.version : '×'}</div>

			<Button>Radix UI Component</Button>
		</div>
	);
}
