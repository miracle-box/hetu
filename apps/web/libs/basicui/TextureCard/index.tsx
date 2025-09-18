import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@repo/ui/card';
import { DataList, DataListItem, DataListLabel, DataListValue } from '@repo/ui/data-list';
import { InlineCode, Large } from '@repo/ui/typography';
import Image from 'next/image';
import { getClientAppConfig } from '~web/libs/hooks/get-client-app-config';
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
	const clientAppConfig = getClientAppConfig();

	return (
		<Card>
			<CardHeader>
				<Large>{texture.name}</Large>
			</CardHeader>

			<CardContent>
				<DataList orientation="vertical" className="gap-2">
					<DataListItem>
						<DataListLabel>Texture ID</DataListLabel>
						<DataListValue>
							<InlineCode>{texture.id}</InlineCode>
						</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>Description</DataListLabel>
						<DataListValue>{texture.description}</DataListValue>
					</DataListItem>
					<DataListItem>
						<DataListLabel>Type</DataListLabel>
						<DataListValue>
							<Badge variant="secondary">
								{texture.type === 'skin'
									? 'Skin (Default)'
									: texture.type === 'skin_slim'
										? 'Skin (Slim)'
										: texture.type === 'cape'
											? 'Cape'
											: 'Unknown'}
							</Badge>
						</DataListValue>
					</DataListItem>
				</DataList>
			</CardContent>

			<CardFooter className="flex flex-col gap-8">
				<div className="relative h-48">
					<Image
						alt="Texture image"
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
