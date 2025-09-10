'use client';

import type { Static } from '@sinclair/typebox';
import { ProfilesDtos, TexturesEntities } from '@repo/api-client';
import { cn } from '@repo/ui';
import { Button } from '@repo/ui/button';
import { useMutation } from '@tanstack/react-query';
import { updateProfile } from '~web/libs/actions/api';
import { TextureCard } from '~web/libs/basicui/TextureCard';
import { SelectProfileModal } from './SelectProfileModal';

export type Props = {
	textures: TexturesEntities.Texture[];
};

export function TexturesList({ textures }: Props) {
	const updateProfilesMut = useMutation({
		mutationFn: ({
			id,
			body,
		}: {
			id: string;
			body: Static<(typeof ProfilesDtos.updateProfileDtoSchemas)['body']>;
		}) => updateProfile(id, body),
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
								if (texture.type === TexturesEntities.TextureType.CAPE) {
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
							<Button>Use</Button>
						</SelectProfileModal>
					</TextureCard>
				))
			) : (
				<span>No textures</span>
			)}
		</div>
	);
}
