'use client';

import { API } from '@repo/api-client';
import { cn } from '@repo/ui';
import { Button } from '@repo/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { updateProfile } from '#/libs/actions/api/profiles';
import { TextureCard } from '#/libs/basicui/TextureCard';
import { SelectProfileModal } from './SelectProfileModal';

export type Props = {
	textures: API.Textures.Entities.Texture[];
};

export function TexturesList({ textures }: Props) {
	const t = useTranslations();
	const updateProfilesMut = useMutation({
		mutationFn: ({ id, body }: { id: string; body: API.Profiles.UpdateProfile.Body }) =>
			updateProfile({ id }, body),
	});

	return (
		<div
			className={cn(
				'grid grid-flow-row grid-cols-1 gap-2',
				'md:grid-cols-2',
				'xl:grid-cols-3',
			)}
		>
			{textures.length > 0 ? (
				textures.map((texture) => (
					<TextureCard key={texture.id} texture={texture}>
						<SelectProfileModal
							onSelect={(profile) => {
								if (texture.type === API.Textures.Entities.TextureType.CAPE) {
									updateProfilesMut.mutate({
										id: profile.id,
										body: {
											capeTextureId: texture.id,
										},
									});
								} else {
									updateProfilesMut.mutate({
										id: profile.id,
										body: {
											skinTextureId: texture.id,
										},
									});
								}
							}}
						>
							<Button>{t('common.buttons.use')}</Button>
						</SelectProfileModal>
					</TextureCard>
				))
			) : (
				<span>{t('dashboard.textures.page.noTextures')}</span>
			)}
		</div>
	);
}
