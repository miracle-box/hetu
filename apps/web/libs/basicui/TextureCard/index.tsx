'use client';

import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@repo/ui/card';
import { DataList, DataListItem, DataListLabel, DataListValue } from '@repo/ui/data-list';
import { InlineCode, Large } from '@repo/ui/typography';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useClientAppConfig } from '~web/libs/hooks/use-client-app-config';

export type Props = {
	texture: {
		type: 'cape' | 'skin' | 'skin_slim';
		id: string;
		name: string;
		description: string;
		hash: string;
		authorId: string;
	};
	children?: React.ReactNode;
};

export function TextureCard({ texture, children }: Props) {
	const t = useTranslations();
	const clientAppConfig = useClientAppConfig();

	return (
		<Card>
			<CardHeader>
				<Large>{texture.name}</Large>
			</CardHeader>

			<CardContent>
				<DataList orientation="vertical" className="gap-2">
					<DataListItem>
						<DataListLabel>{t('common.labels.textureId')}</DataListLabel>
						<DataListValue>
							<InlineCode>{texture.id}</InlineCode>
						</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>{t('common.labels.description')}</DataListLabel>
						<DataListValue>{texture.description}</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>{t('common.labels.type')}</DataListLabel>
						<DataListValue>
							<Badge variant="secondary">
								{texture.type === 'skin'
									? t('common.labels.skinDefault')
									: texture.type === 'skin_slim'
										? t('common.labels.skinSlim')
										: texture.type === 'cape'
											? t('common.labels.cape')
											: t('common.labels.unknown')}
							</Badge>
						</DataListValue>
					</DataListItem>
				</DataList>
			</CardContent>

			<CardFooter className="flex flex-col gap-8">
				<div className="relative h-48">
					<Image
						alt={t('dashboard.textures.components.textureCard.alt')}
						width={64}
						height={texture.type === 'cape' ? 32 : 64}
						src={`${clientAppConfig.textureRoot}/${texture.hash.slice(0, 2)}/${texture.hash}`}
						className=""
						style={{
							imageRendering: 'pixelated',
							height: '12rem',
							width: 'auto',
						}}
						unoptimized
					/>
				</div>

				<div>{children}</div>
			</CardFooter>
		</Card>
	);
}
