import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import { getUserTextures } from '~web/libs/actions/api';
import { CreateTextureModal } from './CreateTextureModal';
import { TexturesList } from './TexturesList';

export default async function Textures() {
	const texturesResp = await getUserTextures();

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>Textures</Large>

				<CreateTextureModal>
					<Button>Create texture</Button>
				</CreateTextureModal>

				{texturesResp
					.bimap(
						({ message }) => <span>{message}</span>,
						({ textures }) => <TexturesList textures={textures}></TexturesList>,
					)
					.extract()}
			</div>
		</main>
	);
}
