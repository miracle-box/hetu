import { Alert, AlertTitle } from '@repo/ui/alert';
import { Large } from '@repo/ui/typography';

export type Props = {
	params: Promise<{ id: string }>;
};

export default async function InspectTexture({ params }: Props) {
	const { id } = await params;

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Texture: {id}</Large>

				<Alert>
					<AlertTitle>ID param: {id}</AlertTitle>
				</Alert>
			</div>
		</main>
	);
}
