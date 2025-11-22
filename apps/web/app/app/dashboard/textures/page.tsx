import { Button } from '@repo/ui/button';
import { Large } from '@repo/ui/typography';
import { getTranslations } from 'next-intl/server';
import { getMyTextures } from '~web/libs/actions/api/me';
import { respToEither } from '~web/libs/api/resp';
import { CreateTextureModal } from './CreateTextureModal';
import { TexturesList } from './TexturesList';

export default async function Textures() {
	const t = await getTranslations();
	const texturesResp = respToEither(await getMyTextures());

	return (
		<main className="container mx-auto">
			<div className="flex flex-col gap-2">
				<Large>{t('dashboard.textures.page.title')}</Large>

				<CreateTextureModal>
					<Button>{t('dashboard.textures.page.createButton')}</Button>
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
