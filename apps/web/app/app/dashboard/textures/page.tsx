import { cn } from '@repo/ui';
import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import { getUserTextures } from '~web/libs/actions/api';
import { AppNav } from '~web/libs/basicui/AppNav';
import { TextureCard } from '~web/libs/basicui/TextureCard';
import { CreateTextureDialog } from './CreateTextureDialog';

export default async function Textures() {
	const texturesResp = await getUserTextures();

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Textures</Large>

				<AppNav />

				<CreateTextureDialog>
					<Button>Create texture</Button>
				</CreateTextureDialog>

				{texturesResp
					.bimap(
						(message) => <span>{message}</span>,

						({ textures }) => (
							<div
								className={cn(
									'grid grid-flow-row grid-cols-1 gap-2',
									'md:grid-cols-2',
									'xl:grid-cols-3',
								)}
							>
								{textures.length > 0 ? (
									textures.map((texture) => (
										<TextureCard key={texture.id} texture={texture} />
									))
								) : (
									<span>No textures</span>
								)}
							</div>
						),
					)
					.extract()}
			</div>
		</main>
	);
}
